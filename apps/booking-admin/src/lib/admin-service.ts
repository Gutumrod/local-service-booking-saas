import { supabase } from './supabase';

export interface AdminBooking {
  id: string;
  booking_code: string;
  booking_date: string;
  start_time: string;
  status: string;
  deposit_status: string;
  deposit_amount: number;
  total_price: number;
  slip_url?: string;
  customers: { name: string; phone: string };
  services: { name: string };
  staff: { name: string; nickname?: string };
}

export async function fetchShopBookings(shopSlug: string = 'good-cuts-barber'): Promise<AdminBooking[]> {
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single();

  if (!shop) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_code,
      booking_date,
      start_time,
      status,
      deposit_status,
      deposit_amount,
      total_price,
      slip_url,
      customers ( name, phone ),
      services ( name ),
      staff ( name, nickname )
    `)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin bookings:', error);
    return [];
  }

  return (data || []) as unknown as AdminBooking[];
}

export async function approveBookingDeposit(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      deposit_status: 'verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error approving booking deposit:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function rejectBookingDeposit(bookingId: string, reason?: string) {
  const { data, error } = await supabase.rpc('reject_deposit_slip', {
    p_booking_id: bookingId,
    p_reason: reason || 'Slip Rejected by Store Owner',
  });

  if (error) {
    console.error('Error rejecting deposit slip:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling booking:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function registerNewShop(payload: {
  name: string;
  slug: string;
  phone: string;
  promptpay_number: string;
  promptpay_name: string;
  line_oa_id?: string;
  subscription_status?: string;
}) {
  const { data, error } = await supabase
    .from('shops')
    .insert({
      name: payload.name,
      slug: payload.slug,
      phone: payload.phone,
      promptpay_number: payload.promptpay_number,
      promptpay_name: payload.promptpay_name,
      line_oa_id: payload.line_oa_id || 'central_booking_oa',
      subscription_status: payload.subscription_status || 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering new shop:', error);
    throw new Error(error.message);
  }

  return data;
}
