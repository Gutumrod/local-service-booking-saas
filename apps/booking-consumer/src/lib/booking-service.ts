import { supabase } from './supabase';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  line_oa_id: string;
  promptpay_number: string;
  promptpay_name: string;
  require_deposit: boolean;
  default_deposit_amount: number;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
}

export interface Staff {
  id: string;
  shop_id: string;
  name: string;
  nickname: string;
  phone: string;
}

export interface StaffSchedule {
  staff_id: string;
  day_of_week: number;
  is_working_day: boolean;
  work_start: string;
  work_end: string;
  break_start: string | null;
  break_end: string | null;
}

export interface ShopHoliday {
  staff_id: string | null;
  holiday_date: string;
  reason: string | null;
}

export interface ShopAvailability {
  schedules: StaffSchedule[];
  holidays: ShopHoliday[];
}

export interface CreateHoldParams {
  shop_id: string;
  service_id: string;
  staff_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  booking_date: string;
  start_time: string;
  notes?: string;
}

export interface HoldResponse {
  booking_id: string;
  booking_code: string;
  link_token: string;
  status: string;
  deposit_status: string;
  deposit_amount: number;
  total_price: number;
  expires_at: string;
  staff_id: string;
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching shop by slug:', error);
    return null;
  }
  return data as Shop;
}

export async function getShopServices(shopId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching shop services:', error);
    return [];
  }
  return (data || []) as Service[];
}

export async function getShopStaff(shopId: string): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('shop_id', shopId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching shop staff:', error);
    return [];
  }
  return (data || []) as Staff[];
}

export async function getShopAvailability(shopId: string): Promise<ShopAvailability> {
  const [schedulesResult, holidaysResult] = await Promise.all([
    supabase
      .from('staff_schedules')
      .select('staff_id, day_of_week, is_working_day, work_start, work_end, break_start, break_end')
      .eq('shop_id', shopId),
    supabase
      .from('shop_holidays')
      .select('staff_id, holiday_date, reason')
      .eq('shop_id', shopId),
  ]);

  if (schedulesResult.error) {
    console.error('Error fetching staff schedules:', schedulesResult.error);
    throw new Error(schedulesResult.error.message || 'Failed to fetch staff schedules');
  }
  if (holidaysResult.error) {
    console.error('Error fetching shop holidays:', holidaysResult.error);
    throw new Error(holidaysResult.error.message || 'Failed to fetch shop holidays');
  }

  return {
    schedules: (schedulesResult.data || []) as StaffSchedule[],
    holidays: (holidaysResult.data || []) as ShopHoliday[],
  };
}

export async function createBookingHold(params: CreateHoldParams): Promise<HoldResponse> {
  const { data, error } = await supabase.rpc('create_booking_hold', {
    p_shop_id: params.shop_id,
    p_service_id: params.service_id,
    p_staff_id: params.staff_id || null,
    p_customer_name: params.customer_name,
    p_customer_phone: params.customer_phone,
    p_customer_email: params.customer_email || null,
    p_booking_date: params.booking_date,
    p_start_time: params.start_time,
    p_notes: params.notes || null,
  });

  if (error) {
    console.error('Error in create_booking_hold RPC:', error);
    throw new Error(error.message || 'Failed to create booking hold');
  }

  return data as HoldResponse;
}

export async function submitDepositSlip(bookingId: string, slipUrl: string, transRef?: string) {
  const { data, error } = await supabase.rpc('submit_deposit_slip', {
    p_booking_id: bookingId,
    p_slip_url: slipUrl,
    p_trans_ref: transRef || null,
  });

  if (error) {
    console.error('Error submitting deposit slip:', error);
    throw new Error(error.message || 'Failed to submit deposit slip');
  }

  return data;
}

export async function uploadDepositSlip(bookingId: string, file: File): Promise<string> {
  const allowedTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const extension = allowedTypes[file.type];

  if (!extension) {
    throw new Error('รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB');
  }

  const objectPath = `${bookingId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('deposit-slips')
    .upload(objectPath, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error('Error uploading deposit slip:', error);
    throw new Error(error.message || 'Failed to upload deposit slip');
  }

  const { data } = supabase.storage.from('deposit-slips').getPublicUrl(objectPath);
  if (!data.publicUrl) {
    throw new Error('Failed to create deposit slip URL');
  }

  return data.publicUrl;
}
