import { supabase } from './supabase';

export type BookingStatus =
  | 'hold'
  | 'pending_review'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'expired';

export type DepositStatus =
  | 'not_required'
  | 'awaiting'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface DashboardBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  totalPrice: number;
  depositPrice: number;
  status: BookingStatus;
  depositStatus: DepositStatus;
  slipUrl?: string;
}

export interface DashboardShop {
  id: string;
  name: string;
  slug: string;
}

export interface AdminDashboardData {
  shop: DashboardShop;
  bookings: DashboardBooking[];
}

interface RelationName {
  name: string;
}

interface RelationCustomer extends RelationName {
  phone: string;
}

interface RelationStaff extends RelationName {
  nickname: string | null;
}

interface RawBooking {
  id: string;
  booking_code: string;
  booking_date: string;
  start_time: string;
  status: BookingStatus;
  deposit_status: DepositStatus;
  deposit_amount: number | string | null;
  total_price: number | string;
  slip_url: string | null;
  customers: RelationCustomer | RelationCustomer[] | null;
  services: RelationName | RelationName[] | null;
  staff: RelationStaff | RelationStaff[] | null;
}

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function toAmount(value: number | string | null): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  const { data: membership, error: membershipError } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('user_id', authData.user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new Error(membershipError?.message || 'ไม่พบสิทธิ์ร้านค้าของบัญชีนี้');
  }

  const [shopResult, bookingsResult] = await Promise.all([
    supabase
      .from('shops')
      .select('id, name, slug')
      .eq('id', membership.shop_id)
      .single(),
    supabase
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
      .eq('shop_id', membership.shop_id)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false }),
  ]);

  if (shopResult.error || !shopResult.data) {
    throw new Error(shopResult.error?.message || 'โหลดข้อมูลร้านค้าไม่สำเร็จ');
  }

  if (bookingsResult.error) {
    throw new Error(bookingsResult.error.message);
  }

  const bookings = ((bookingsResult.data ?? []) as unknown as RawBooking[]).map((booking) => {
    const customer = firstRelation(booking.customers);
    const service = firstRelation(booking.services);
    const staff = firstRelation(booking.staff);

    return {
      id: booking.id,
      bookingCode: booking.booking_code,
      customerName: customer?.name ?? 'ไม่พบชื่อลูกค้า',
      phone: customer?.phone ?? '-',
      serviceName: service?.name ?? 'ไม่พบบริการ',
      staffName: staff?.nickname || staff?.name || 'ยังไม่ระบุพนักงาน',
      date: booking.booking_date,
      time: booking.start_time.slice(0, 5),
      totalPrice: toAmount(booking.total_price),
      depositPrice: toAmount(booking.deposit_amount),
      status: booking.status,
      depositStatus: booking.deposit_status,
      slipUrl: booking.slip_url ?? undefined,
    } satisfies DashboardBooking;
  });

  return {
    shop: shopResult.data as DashboardShop,
    bookings,
  };
}

export async function approveBookingDeposit(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_booking_deposit', {
    p_booking_id: bookingId,
  });

  if (error) throw new Error(error.message);
}

export async function rejectBookingDeposit(bookingId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('reject_deposit_slip', {
    p_booking_id: bookingId,
    p_reason: reason,
  });

  if (error) throw new Error(error.message);
}

export async function cancelBooking(bookingId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
    p_reason: reason,
  });

  if (error) throw new Error(error.message);
}
