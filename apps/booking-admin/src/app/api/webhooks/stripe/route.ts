import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// --- Configuration -----------------------------------------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

function getStripeClient(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(STRIPE_SECRET_KEY);
}

// The Stripe API still returns current_period_end on subscription objects in
// the JSON payload, but the SDK v22 type definitions don't expose it (the
// field was replaced by billing_cycle_anchor in the typed interface). We
// declare it here so we can access the raw API value without losing type
// safety on the rest of the object.
type SubscriptionWithPeriodEnd = Stripe.Subscription & {
  current_period_end?: number | null;
};

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): number | null {
  const raw = sub as SubscriptionWithPeriodEnd;
  return raw.current_period_end ?? null;
}

// --- Price-to-plan mapping ---------------------------------------------------
// Per the design doc, price_id maps to plan 'basic_490' or 'pro_990'.
// The actual price IDs are set up in the Stripe Dashboard (E4.2) and stored
// as env vars STRIPE_PRICE_BASIC / STRIPE_PRICE_PRO. Until those exist, we
// fall back to a heuristic on the price lookup key or leave the plan as-is.
function mapPriceIdToPlan(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_BASIC) return 'basic_490';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro_990';
  // Fallback heuristic: if env vars aren't set yet, guess from common patterns.
  if (priceId.includes('basic') || priceId.includes('490')) return 'basic_490';
  if (priceId.includes('pro') || priceId.includes('990')) return 'pro_990';
  return null;
}

// --- Event payload extraction helpers ---------------------------------------

interface CheckoutSessionPayload {
  shopId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string | null;
  status: string;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

function extractCheckoutSession(
  session: Stripe.Checkout.Session,
): CheckoutSessionPayload {
  // Per design doc section 2.2.1:
  //   session.client_reference_id or session.metadata.shop_id -> shop_id
  //   session.customer -> stripe_customer_id
  //   session.subscription -> stripe_subscription_id
  const shopId =
    (session.client_reference_id as string | null) ??
    (session.metadata?.shop_id as string | null) ??
    null;
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  // Determine plan from metadata (the checkout route in E4.5 will set this).
  let plan: string | null = null;
  if (session.metadata?.plan) {
    plan = session.metadata.plan;
  }

  return {
    shopId,
    stripeCustomerId,
    stripeSubscriptionId,
    plan,
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };
}

interface SubscriptionPayload {
  stripeSubscriptionId: string;
  plan: string | null;
  status: string;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

function extractSubscription(sub: Stripe.Subscription): SubscriptionPayload {
  // Per design doc section 2.2.2:
  //   subscription.id -> stripe_subscription_id
  //   subscription.items.data[0].price.id -> map to plan
  //   subscription.status -> status
  //   subscription.current_period_end -> current_period_end
  //   subscription.cancel_at_period_end -> cancel_at_period_end
  const priceId = sub.items.data[0]?.price?.id ?? null;
  return {
    stripeSubscriptionId: sub.id,
    plan: mapPriceIdToPlan(priceId),
    status: sub.status,
    currentPeriodEnd: getSubscriptionPeriodEnd(sub),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

interface InvoicePayload {
  stripeSubscriptionId: string | null;
  invoicePeriodEnd: number | null;
}

function extractInvoice(invoice: Stripe.Invoice): InvoicePayload {
  // Per design doc section 2.2.4 and 2.2.5:
  //   invoice.subscription -> stripe_subscription_id
  // In Stripe SDK v22, the subscription ID is nested under
  // parent.subscription_details.subscription (string | Subscription).
  const subDetails = invoice.parent?.subscription_details;
  const subId = subDetails
    ? (typeof subDetails.subscription === 'string'
        ? subDetails.subscription
        : subDetails.subscription?.id ?? null)
    : null;

  return {
    stripeSubscriptionId: subId,
    invoicePeriodEnd: invoice.period_end ?? null,
  };
}

// --- Idempotency guard -------------------------------------------------------

async function isDuplicateEvent(
  eventId: string,
  eventType: string,
  eventCreated: number,
): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();

  // Use upsert with ignoreDuplicates to generate the exact SQL pattern from
  // design doc section 4.3.2:
  //   INSERT INTO ... ON CONFLICT (id) DO NOTHING RETURNING id
  // If a row is returned, this is a new event. If no row is returned, the
  // event is a duplicate and processing should be skipped.
  const { data, error } = await supabaseAdmin
    .from('stripe_webhook_events')
    .upsert(
      {
        id: eventId,
        type: eventType,
        created_at: new Date(eventCreated * 1000).toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
    .select('id');

  if (error) {
    // A non-duplicate error is a real DB problem; log it and treat as
    // non-duplicate so processing continues (better to attempt the write
    // and fail-log than to drop a legitimate event silently).
    console.error('stripe_webhook_events insert failed', {
      eventId,
      eventType,
      error: error.message,
      code: error.code,
    });
    return false;
  }

  // No row returned means ON CONFLICT DO NOTHING fired — duplicate event.
  return !data || data.length === 0;
}

// --- RPC helper for atomic state sync ---------------------------------------

interface SyncStateParams {
  eventType: string;
  eventCreated: number;
  shopId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean | null;
}

async function syncSubscriptionState(params: SyncStateParams): Promise<{ applied: boolean }> {
  const supabaseAdmin = getSupabaseAdmin();

  const rpcArgs: Record<string, unknown> = {
    p_event_type: params.eventType,
    p_event_created: params.eventCreated,
    p_shop_id: params.shopId,
    p_stripe_customer_id: params.stripeCustomerId,
    p_stripe_subscription_id: params.stripeSubscriptionId,
    p_plan: params.plan,
    p_status: params.status,
    p_current_period_end: params.currentPeriodEnd,
    p_cancel_at_period_end: params.cancelAtPeriodEnd,
  };

  const { data, error } = await supabaseAdmin.rpc('sync_subscription_state', rpcArgs);

  if (error) {
    throw new Error(`sync_subscription_state RPC failed: ${error.message}`);
  }

  const result = data as { applied: boolean; matched_shop_id: string | null }[] | null;
  const applied = result?.[0]?.applied ?? false;
  return { applied };
}

// --- Main webhook handler ----------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Read the raw body BEFORE any JSON parsing (needed for signature verify).
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('stripe-signature');

  if (!signatureHeader) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  // 2. Verify the Stripe signature. On failure, return 400 immediately
  //    without touching the database.
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let stripeClient: Stripe;
  try {
    stripeClient = getStripeClient();
  } catch (err) {
    console.error('Stripe client init failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: 'Stripe client not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    // Signature verification failure — return 400, do NOT touch the DB.
    return NextResponse.json(
      { error: 'Invalid Stripe signature' },
      { status: 400 },
    );
  }

  // 3. Idempotency guard: insert into stripe_webhook_events. If the event.id
  //    already exists (duplicate), return 200 immediately.
  try {
    const duplicate = await isDuplicateEvent(event.id, event.type, event.created);
    if (duplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (err) {
    // If the idempotency insert itself fails (non-duplicate error), log it
    // but still return 200 to Stripe — we don't want a retry storm on a
    // DB infrastructure issue. The event will be retried by Stripe and may
    // be processed on the next attempt.
    console.error('Idempotency guard failed', {
      eventId: event.id,
      eventType: event.type,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ received: true, error: 'idempotency_guard_failed' });
  }

  // 4. Dispatch to the appropriate event handler. Each handler calls the
  //    sync_subscription_state RPC, which atomically writes to subscriptions
  //    AND shops.subscription_status in a single transaction, and includes
  //    the out-of-order timestamp guard internally.
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const payload = extractCheckoutSession(session);

        // If the checkout has a subscription, fetch the full subscription object
        // to get the status, current_period_end, and cancel_at_period_end.
        if (payload.stripeSubscriptionId) {
          try {
            const sub = await stripeClient.subscriptions.retrieve(
              payload.stripeSubscriptionId,
            );
            payload.status = sub.status;
            payload.currentPeriodEnd = getSubscriptionPeriodEnd(sub);
            payload.cancelAtPeriodEnd = sub.cancel_at_period_end;
            if (!payload.plan) {
              payload.plan = mapPriceIdToPlan(sub.items.data[0]?.price?.id);
            }
          } catch (err) {
            console.error('Failed to retrieve subscription after checkout', {
              subscriptionId: payload.stripeSubscriptionId,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        await syncSubscriptionState({
          eventType: event.type,
          eventCreated: event.created,
          shopId: payload.shopId,
          stripeCustomerId: payload.stripeCustomerId,
          stripeSubscriptionId: payload.stripeSubscriptionId,
          plan: payload.plan,
          status: payload.status,
          currentPeriodEnd: payload.currentPeriodEnd,
          cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const payload = extractSubscription(sub);

        await syncSubscriptionState({
          eventType: event.type,
          eventCreated: event.created,
          shopId: null,
          stripeCustomerId: null,
          stripeSubscriptionId: payload.stripeSubscriptionId,
          plan: payload.plan,
          status: payload.status,
          currentPeriodEnd: payload.currentPeriodEnd,
          cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const payload = extractSubscription(sub);

        await syncSubscriptionState({
          eventType: event.type,
          eventCreated: event.created,
          shopId: null,
          stripeCustomerId: null,
          stripeSubscriptionId: payload.stripeSubscriptionId,
          plan: null,
          status: 'canceled',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const payload = extractInvoice(invoice);

        // For invoice.paid, use the invoice's period_end as the current
        // billing period end. This is the most reliable source — it comes
        // directly from the invoice object without needing an extra API call.
        const currentPeriodEnd = payload.invoicePeriodEnd;

        await syncSubscriptionState({
          eventType: event.type,
          eventCreated: event.created,
          shopId: null,
          stripeCustomerId: null,
          stripeSubscriptionId: payload.stripeSubscriptionId,
          plan: null,
          status: 'active',
          currentPeriodEnd,
          cancelAtPeriodEnd: null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const payload = extractInvoice(invoice);

        await syncSubscriptionState({
          eventType: event.type,
          eventCreated: event.created,
          shopId: null,
          stripeCustomerId: null,
          stripeSubscriptionId: payload.stripeSubscriptionId,
          plan: null,
          status: 'past_due',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: null,
        });
        break;
      }

      default:
        // Event type we don't handle — ack it so Stripe doesn't retry.
        break;
    }
  } catch (err) {
    // 7. Error handling: if an internal DB write fails partway through, log
    //    the error server-side but still return HTTP 200 to Stripe. Stripe
    //    will retry-storm a webhook that keeps returning non-2xx, which is
    //    worse than a logged failure. The ONLY case that returns non-200 is
    //    signature verification failure (handled above, returns 400).
    console.error('Stripe webhook event processing failed', {
      eventId: event.id,
      eventType: event.type,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ received: true, error: 'internal_processing_error' });
  }

  return NextResponse.json({ received: true });
}