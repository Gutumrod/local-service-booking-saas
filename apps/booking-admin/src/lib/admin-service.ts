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
  role: 'owner' | 'admin' | 'staff';
}

export interface DashboardService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
  isActive: boolean;
}

export interface DashboardStaff {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export interface AdminDashboardData {
  shop: DashboardShop;
  bookings: DashboardBooking[];
  services: DashboardService[];
  staff: DashboardStaff[];
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

interface RawService {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | string;
  deposit_amount: number | string | null;
  is_active: boolean;
}

interface RawStaff {
  id: string;
  name: string;
  nickname: string | null;
  phone: string | null;
  is_active: boolean;
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
    .select('shop_id, role')
    .eq('user_id', authData.user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new Error(membershipError?.message || 'ไม่พบสิทธิ์ร้านค้าของบัญชีนี้');
  }

  const [shopResult, bookingsResult, servicesResult, staffResult] = await Promise.all([
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
    supabase
      .from('services')
      .select('id, name, description, duration_minutes, price, deposit_amount, is_active')
      .eq('shop_id', membership.shop_id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: true }),
    supabase
      .from('staff')
      .select('id, name, nickname, phone, is_active')
      .eq('shop_id', membership.shop_id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: true }),
  ]);

  if (shopResult.error || !shopResult.data) {
    throw new Error(shopResult.error?.message || 'โหลดข้อมูลร้านค้าไม่สำเร็จ');
  }

  if (bookingsResult.error) {
    throw new Error(bookingsResult.error.message);
  }

  if (servicesResult.error) {
    throw new Error(servicesResult.error.message);
  }

  if (staffResult.error) {
    throw new Error(staffResult.error.message);
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
    shop: {
      ...shopResult.data,
      role: membership.role as DashboardShop['role'],
    },
    bookings,
    services: ((servicesResult.data ?? []) as unknown as RawService[]).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description ?? '',
      duration: service.duration_minutes,
      price: toAmount(service.price),
      deposit: toAmount(service.deposit_amount),
      isActive: service.is_active,
    })),
    staff: ((staffResult.data ?? []) as unknown as RawStaff[]).map((staffMember) => ({
      id: staffMember.id,
      name: staffMember.name,
      phone: staffMember.phone ?? '-',
      role: staffMember.nickname || 'พนักงานให้บริการ',
      isActive: staffMember.is_active,
    })),
  };
}

export interface ServiceInput {
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
}

export async function createService(shopId: string, input: ServiceInput): Promise<void> {
  const { error } = await supabase.rpc('create_service', {
    p_shop_id: shopId,
    p_name: input.name,
    p_description: input.description,
    p_duration_minutes: input.duration,
    p_price: input.price,
    p_deposit_amount: input.deposit,
    p_idempotency_key: crypto.randomUUID(),
  });

  if (error) throw new Error(error.message);
}

export async function updateService(serviceId: string, input: ServiceInput): Promise<void> {
  const { error } = await supabase.rpc('update_service', {
    p_service_id: serviceId,
    p_name: input.name,
    p_description: input.description,
    p_duration_minutes: input.duration,
    p_price: input.price,
    p_deposit_amount: input.deposit,
  });

  if (error) throw new Error(error.message);
}

export async function setServiceActive(serviceId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_service_active', {
    p_service_id: serviceId,
    p_is_active: isActive,
  });

  if (error) throw new Error(error.message);
}

export async function createStaff(shopId: string, name: string, phone: string): Promise<void> {
  const { error } = await supabase.rpc('create_staff', {
    p_shop_id: shopId,
    p_name: name,
    p_phone: phone,
    p_idempotency_key: crypto.randomUUID(),
  });

  if (error) throw new Error(error.message);
}

export async function setStaffActive(staffId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_staff_active', {
    p_staff_id: staffId,
    p_is_active: isActive,
  });

  if (error) throw new Error(error.message);
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
