import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '../../../../lib/supabase';
import { createBookingBoundFlexCard } from '../../../../lib/line-flex-templates';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

function verifySignature(body: string, signature: string | null): boolean {
  if (!LINE_CHANNEL_SECRET || !signature) return process.env.NODE_ENV !== 'production';
  const hmac = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(body).digest('base64');
  return hmac === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid LINE signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const events = payload.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const userMessage = (event.message.text || '').trim();
        const replyToken = event.replyToken;
        const lineUserId = event.source?.userId;

        // Check for binding pattern: "ผูกคิว BK-7K2M9Q-A3F2" or "ผูกคิว BK-7K2M9Q A3F2"
        const match = userMessage.match(/ผูกคิว\s+([A-Z0-9-]+)[-\s]+([A-Z0-9]+)/i);

        if (match && lineUserId) {
          const bookingCode = match[1].toUpperCase();
          const linkToken = match[2].toUpperCase();

          // Query matching booking from Supabase
          const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
              id,
              shop_id,
              customer_id,
              booking_code,
              link_token,
              link_token_expires_at,
              booking_date,
              start_time,
              status,
              deposit_status,
              deposit_amount,
              total_price,
              shops ( name, line_oa_id ),
              services ( name ),
              staff ( name, nickname )
            `)
            .eq('booking_code', bookingCode)
            .single();

          if (error || !booking) {
            console.warn(`Booking not found for code: ${bookingCode}`);
            continue;
          }

          // Validate token match & expiry
          if (booking.link_token !== linkToken) {
            console.warn(`Invalid link token for booking: ${bookingCode}`);
            continue;
          }

          if (booking.link_token_expires_at && new Date(booking.link_token_expires_at) < new Date()) {
            console.warn(`Link token expired for booking: ${bookingCode}`);
            continue;
          }

          // 1. Upsert into local_service.line_users
          await supabase.from('line_users').upsert({
            shop_id: booking.shop_id,
            customer_id: booking.customer_id,
            line_user_id: lineUserId,
          }, { onConflict: 'shop_id, line_user_id' });

          // 2. Update customer record
          if (booking.customer_id) {
            await supabase.from('customers').update({ line_user_id: lineUserId }).eq('id', booking.customer_id);
          }

          // 3. Log notification
          await supabase.from('line_notification_logs').insert({
            shop_id: booking.shop_id,
            booking_id: booking.id,
            event_type: 'booking_created',
            recipient_type: 'customer',
            status: 'sent',
          });

          // 4. Generate Flex Card Payload
          const flexCard = createBookingBoundFlexCard({
            bookingCode: booking.booking_code,
            shopName: (booking.shops as any)?.name || 'ร้านค้าบริการ',
            serviceName: (booking.services as any)?.name || 'บริการ',
            staffName: (booking.staff as any)?.nickname || (booking.staff as any)?.name || 'ไม่ระบุพนักงาน',
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            statusText: booking.status === 'confirmed' ? 'ยืนยันคิวเรียบร้อย' : 'รอตรวจสอบสลิป',
            depositAmount: booking.deposit_amount || 0,
            totalPrice: booking.total_price || 0,
          });

          // Send LINE reply message if channel access token is configured
          if (LINE_CHANNEL_ACCESS_TOKEN && replyToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken,
                messages: [flexCard],
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, processedEvents: events.length });
  } catch (err: any) {
    console.error('Error in LINE webhook gateway:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
