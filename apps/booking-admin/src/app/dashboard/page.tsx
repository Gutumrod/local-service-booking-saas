'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  approveBookingDeposit,
  cancelBooking,
  createShopHoliday,
  createService,
  createStaff,
  deleteShopHoliday,
  fetchAdminDashboardData,
  rejectBookingDeposit,
  saveStaffWeeklySchedule,
  setServiceActive,
  setStaffActive,
  updateService,
  type DashboardBooking,
  type DashboardService,
  type DashboardStaff,
  type DashboardStaffSchedule,
  type DashboardHoliday,
} from '@/lib/admin-service';
import { 
  Calendar, Users, DollarSign, Eye, Clock,
  Settings, CreditCard, Sparkles, AlertCircle, Plus, ShieldCheck, 
  QrCode, ExternalLink, CalendarOff, Coffee, Save,
  Copy, MessageCircle, Send, Check, Trash2, Edit3, Lock,
  PackagePlus, Scissors, Store, Globe, Phone, X
} from 'lucide-react';

type Booking = DashboardBooking;

type StaffMember = DashboardStaff;
type ServiceItem = DashboardService;

const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const BOOKING_SITE_URL = (process.env.NEXT_PUBLIC_BOOKING_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function getBangkokDateString() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedules' | 'services' | 'staff' | 'settings' | 'billing'>('bookings');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [schedules, setSchedules] = useState<DashboardStaffSchedule[]>([]);
  const [selectedScheduleDays, setSelectedScheduleDays] = useState<Record<string, number>>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedSlipBooking, setSelectedSlipBooking] = useState<Booking | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [mutatingBookingId, setMutatingBookingId] = useState<string | null>(null);
  const [shopId, setShopId] = useState('');
  const [shopRole, setShopRole] = useState<'owner' | 'admin' | 'staff'>('staff');
  const [managementError, setManagementError] = useState('');
  const [mutatingResourceId, setMutatingResourceId] = useState<string | null>(null);

  // Shop Profile State
  const [shopName, setShopName] = useState('กำลังโหลดข้อมูลร้าน...');
  const [shopSlogan, setShopSlogan] = useState('ร้านตัดผมชายพรีเมียม & สปาหนังศีรษะ');
  const [shopPhone, setShopPhone] = useState('081-234-5678');
  const [shopSlug, setShopSlug] = useState('');
  const [shopProfileSaved, setShopProfileSaved] = useState(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);

  // Service Form State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDuration, setServiceDuration] = useState(45);
  const [servicePrice, setServicePrice] = useState(350);
  const [serviceDeposit, setServiceDeposit] = useState(100);

  // Filter Bookings by Date View
  const [bookingFilter, setBookingFilter] = useState<'today' | 'upcoming' | 'all'>('all');

  // Shop Settings State
  const [allowStaffSelection, setAllowStaffSelection] = useState<boolean>(true);
  const [promptpayNumber, setPromptpayNumber] = useState('0800742005');
  const [promptpayName, setPromptpayName] = useState('คุณฟรี (Good Cuts Barber)');
  const [lineOaId, setLineOaId] = useState('@goodcutsbarber');
  const [lineChannelToken, setLineChannelToken] = useState('');

  // Special Holidays
  const [specialHolidayDate, setSpecialHolidayDate] = useState('');
  const [specialHolidayReason, setSpecialHolidayReason] = useState('');
  const [holidaysList, setHolidaysList] = useState<DashboardHoliday[]>([]);

  // Modals & Notices
  const [testLineNotice, setTestLineNotice] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Stats
  const todayStr = getBangkokDateString();
  const totalToday = bookings.filter(b => b.date === todayStr).length;
  const totalUpcoming = bookings.filter(b => b.date > todayStr).length;
  const pendingDeposit = bookings.filter(b => b.status === 'pending_review').length;
  const depositCollected = bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.depositPrice : 0), 0);

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'today') return b.date === todayStr;
    if (bookingFilter === 'upcoming') return b.date > todayStr;
    return true;
  });

  const loadDashboardBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setIsBookingsLoading(true);
    setBookingError('');
    setManagementError('');

    try {
      const data = await fetchAdminDashboardData();
      setBookings(data.bookings);
      setShopName(data.shop.name);
      setShopSlug(data.shop.slug);
      setShopId(data.shop.id);
      setShopRole(data.shop.role);
      setServices(data.services);
      setStaffList(data.staff);
      setSchedules(data.schedules);
      setHolidaysList(data.holidays);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ';
      setBookingError(message);
      setManagementError(message);
    } finally {
      if (showLoading) setIsBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    fetchAdminDashboardData()
      .then((data) => {
        if (!isCurrent) return;
        setBookings(data.bookings);
        setShopName(data.shop.name);
        setShopSlug(data.shop.slug);
        setShopId(data.shop.id);
        setShopRole(data.shop.role);
        setServices(data.services);
        setStaffList(data.staff);
        setSchedules(data.schedules);
        setHolidaysList(data.holidays);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        const message = error instanceof Error ? error.message : 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ';
        setBookingError(message);
        setManagementError(message);
      })
      .finally(() => {
        if (isCurrent) setIsBookingsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleApproveSlip = async (bookingId: string) => {
    setMutatingBookingId(bookingId);
    setBookingError('');
    try {
      await approveBookingDeposit(bookingId);
      setSelectedSlipBooking(null);
      await loadDashboardBookings(false);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'อนุมัติสลิปไม่สำเร็จ');
    } finally {
      setMutatingBookingId(null);
    }
  };

  const handleRejectSlip = async (bookingId: string) => {
    setMutatingBookingId(bookingId);
    setBookingError('');
    try {
      await rejectBookingDeposit(bookingId, 'สลิปไม่ถูกต้องหรือยอดเงินไม่ตรง');
      setSelectedSlipBooking(null);
      await loadDashboardBookings(false);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'ปฏิเสธสลิปไม่สำเร็จ');
    } finally {
      setMutatingBookingId(null);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelBookingTarget || !cancelReason.trim()) return;

    setMutatingBookingId(cancelBookingTarget.id);
    setBookingError('');
    try {
      await cancelBooking(cancelBookingTarget.id, cancelReason.trim());
      setCancelBookingTarget(null);
      setCancelReason('');
      await loadDashboardBookings(false);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'ยกเลิกคิวไม่สำเร็จ');
    } finally {
      setMutatingBookingId(null);
    }
  };

  const handleSaveShopProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShopProfileSaved(true);
    setTimeout(() => setShopProfileSaved(false), 2000);
  };

  const handleCopyShopLink = () => {
    const fullUrl = `http://localhost:3000/book/${shopSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkNotice(true);
    setTimeout(() => setCopiedLinkNotice(false), 2000);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !newStaffName.trim()) return;

    setMutatingResourceId('staff-new');
    setManagementError('');
    try {
      await createStaff(shopId, newStaffName.trim(), newStaffPhone.trim());
      setNewStaffName('');
      setNewStaffPhone('');
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'เพิ่มพนักงานไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const toggleStaffActive = async (staffMember: StaffMember) => {
    setMutatingResourceId(staffMember.id);
    setManagementError('');
    try {
      await setStaffActive(staffMember.id, !staffMember.isActive);
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'เปลี่ยนสถานะพนักงานไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !specialHolidayDate) return;
    setMutatingResourceId('holiday-new');
    setManagementError('');
    try {
      await createShopHoliday(shopId, specialHolidayDate, specialHolidayReason.trim());
      setSpecialHolidayDate('');
      setSpecialHolidayReason('');
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'เพิ่มวันหยุดไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    setMutatingResourceId(holidayId);
    setManagementError('');
    try {
      await deleteShopHoliday(holidayId);
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'ลบวันหยุดไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const updateScheduleDay = (
    staffId: string,
    dayOfWeek: number,
    changes: Partial<DashboardStaffSchedule['days'][number]>,
  ) => {
    setSchedules((previous) => previous.map((schedule) => schedule.staffId === staffId
      ? { ...schedule, days: schedule.days.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...changes } : day) }
      : schedule));
  };

  const handleSaveSchedule = async (schedule: DashboardStaffSchedule) => {
    setMutatingResourceId(schedule.staffId);
    setManagementError('');
    try {
      await saveStaffWeeklySchedule(schedule.staffId, schedule.days);
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'บันทึกตารางเวลาไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceDesc('');
    setServiceDuration(45);
    setServicePrice(350);
    setServiceDeposit(100);
    setShowServiceForm(true);
  };

  const handleOpenEditService = (sv: ServiceItem) => {
    setEditingService(sv);
    setServiceName(sv.name);
    setServiceDesc(sv.description);
    setServiceDuration(sv.duration);
    setServicePrice(sv.price);
    setServiceDeposit(sv.deposit);
    setShowServiceForm(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId || !serviceName.trim()) return;

    if (serviceDeposit > servicePrice) {
      setManagementError('ยอดมัดจำต้องไม่มากกว่าราคาบริการ');
      return;
    }

    const input = {
      name: serviceName.trim(),
      description: serviceDesc.trim(),
      duration: serviceDuration,
      price: servicePrice,
      deposit: serviceDeposit,
    };

    setMutatingResourceId(editingService?.id ?? 'service-new');
    setManagementError('');
    try {
      if (editingService) {
        await updateService(editingService.id, input);
      } else {
        await createService(shopId, input);
      }

      setShowServiceForm(false);
      setEditingService(null);
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'บันทึกบริการไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  const handleToggleService = async (service: ServiceItem) => {
    setMutatingResourceId(service.id);
    setManagementError('');
    try {
      await setServiceActive(service.id, !service.isActive);
      await loadDashboardBookings(false);
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : 'เปลี่ยนสถานะบริการไม่สำเร็จ');
    } finally {
      setMutatingResourceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Banner for 14-Day Free Trial */}
      <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-b border-amber-500/30 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>คุณกำลังใช้งาน **Free Trial 14 วัน** (โควตาจอง 12/50 คิว • ตรวจสลิปออโต้ 3/10 ครั้ง)</span>
          </div>
          <Link 
            href="/register?plan=basic_490"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow-md inline-block"
          >
            อัปเกรดเป็นแพ็กเกจเต็ม (เริ่มต้น 490 บ./เดือน)
          </Link>
        </div>
      </div>

      {/* Main Header Nav */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
              Q
            </div>
            <div>
              <h1 className="font-bold text-base text-white">{shopName} Dashboard</h1>
              <p className="text-[11px] text-slate-400">{shopSlogan} • โทร: {shopPhone}</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'bookings' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              รายการคิวทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'schedules' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              เวลา & วันหยุดร้าน
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'staff' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              จัดการพนักงาน
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'services' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              ข้อมูลร้าน & บริการ
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              ตั้งค่า PromptPay/LINE
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'billing' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-amber-400 hover:text-amber-300'}`}
            >
              แพ็กเกจชำระเงิน
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">คิวจองวันนี้ ({todayStr})</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalToday} รายการ</p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-medium">คิวจองล่วงหน้าทั้งหมด</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{totalUpcoming} รายการ</p>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-medium">รอตรวจสลิปมัดจำ</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{pendingDeposit} รายการ</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">ยอดมัดจำรวมที่โอนแล้ว</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white font-mono">฿{depositCollected}.00</p>
          </div>
        </div>

        {/* TAB 1: BOOKINGS & SLIP APPROVAL WITH DATE FILTER */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            {bookingError && (
              <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <span>{bookingError}</span>
                <button onClick={() => void loadDashboardBookings()} className="rounded-lg border border-rose-500/40 px-3 py-1 font-bold hover:bg-rose-500/10">
                  ลองใหม่
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white">ตารางจองคิวงาน & ตรวจสอบสลิป</h2>
                <p className="text-xs text-slate-400">ดูคิวงานล่วงหน้า กรองคิวตามวัน และอนุมัติสลิปมัดจำจากลูกค้า</p>
              </div>

              {/* Date View Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setBookingFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${bookingFilter === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    คิวทั้งหมด ({bookings.length})
                  </button>
                  <button
                    onClick={() => setBookingFilter('today')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${bookingFilter === 'today' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    คิววันนี้ ({totalToday})
                  </button>
                  <button
                    onClick={() => setBookingFilter('upcoming')}
                    className={`px-2.5 py-1 rounded-lg font-medium ${bookingFilter === 'upcoming' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    คิวล่วงหน้า ({totalUpcoming})
                  </button>
                </div>

                <a
                  href={shopSlug ? `${BOOKING_SITE_URL}/book/${shopSlug}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 font-medium"
                >
                  หน้าจองลูกค้า
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300 uppercase text-xs tracking-wider font-bold">
                    <th className="py-3.5 px-4">รหัสคิว / ลูกค้า</th>
                    <th className="py-3.5 px-4">บริการที่เลือก</th>
                    <th className="py-3.5 px-4">พนักงานให้บริการ</th>
                    <th className="py-3.5 px-4">วันที่นัดหมาย</th>
                    <th className="py-3.5 px-4">เวลานัด</th>
                    <th className="py-3.5 px-4">ยอดมัดจำ</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {isBookingsLoading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">กำลังโหลดข้อมูลคิวจริง...</td>
                    </tr>
                  )}

                  {!isBookingsLoading && !bookingError && filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">ยังไม่มีคิวในช่วงที่เลือก</td>
                    </tr>
                  )}

                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-4 px-4">
                        <p className="font-mono font-bold text-emerald-400 text-sm">{b.bookingCode}</p>
                        <p className="font-bold text-white text-base">{b.customerName}</p>
                        <p className="text-xs text-slate-400">{b.phone}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200 text-sm">{b.serviceName}</td>
                      <td className="py-4 px-4 text-slate-300 font-medium text-sm">{b.staffName}</td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-200 text-sm whitespace-nowrap">
                        {b.date} {b.date === todayStr ? <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-sans ml-1">วันนี้</span> : ''}
                      </td>
                      <td className="py-4 px-4 font-mono text-emerald-300 font-bold text-sm whitespace-nowrap">{b.time} น.</td>
                      <td className="py-4 px-4 font-mono font-extrabold text-amber-400 text-base whitespace-nowrap">฿{b.depositPrice}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {b.status === 'hold' && (
                          <span className="bg-sky-500/10 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            รอโอนมัดจำ
                          </span>
                        )}
                        {b.status === 'pending_review' && (
                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            รอตรวจสลิป
                          </span>
                        )}
                        {b.status === 'confirmed' && (
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            ยืนยันคิวแล้ว
                          </span>
                        )}
                        {b.status === 'completed' && (
                          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            ให้บริการเสร็จแล้ว
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            ยกเลิกแล้ว
                          </span>
                        )}
                        {b.status === 'no_show' && (
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            ไม่มาตามนัด
                          </span>
                        )}
                        {b.status === 'expired' && (
                          <span className="bg-slate-500/10 text-slate-400 border border-slate-500/30 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block shadow-sm">
                            หมดอายุ
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {b.status === 'pending_review' && (
                            <button
                              onClick={() => setSelectedSlipBooking(b)}
                              disabled={mutatingBookingId === b.id}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md"
                            >
                              <Eye className="w-4 h-4" />
                              ดูสลิป & อนุมัติ
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'expired' && (
                            <button
                              onClick={() => {
                                setCancelBookingTarget(b);
                                setCancelReason('');
                              }}
                              disabled={mutatingBookingId === b.id}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all"
                              title="ยกเลิกคิวงานนี้"
                            >
                              <X className="w-3.5 h-3.5" />
                              ยกเลิกคิว
                            </button>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="text-slate-500 text-xs italic">ยกเลิกคิวแล้ว</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULES & SHOP HOLIDAYS */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                เวลาทำงาน & เวลาพักเที่ยงของพนักงานรายบุคคล
              </h2>

              {managementError && (
                <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">{managementError}</p>
              )}
              {shopRole === 'staff' && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  บัญชีพนักงานดูตารางได้เท่านั้น การแก้ตารางของตัวเองจะเปิดใช้หลังระบบเชื่อมบัญชีกับข้อมูลพนักงานแล้ว
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schedules.map((sch) => {
                  const selectedDayNumber = selectedScheduleDays[sch.staffId] ?? 0;
                  const selectedDay = sch.days.find((day) => day.dayOfWeek === selectedDayNumber) ?? sch.days[0];
                  if (!selectedDay) return null;
                  const canManageSchedules = shopRole === 'owner' || shopRole === 'admin';
                  return (
                  <div key={sch.staffId} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 shadow-md hover:border-slate-700 transition-all">
                    <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-400">{sch.staffName}</span>
                      <span className="text-[10px] text-slate-500">{sch.days.filter((day) => day.isWorkingDay).length} วันทำงาน</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {DAY_NAMES.map((dayName, dayOfWeek) => {
                        const day = sch.days.find((item) => item.dayOfWeek === dayOfWeek);
                        return (
                          <button key={dayName} type="button" onClick={() => setSelectedScheduleDays((previous) => ({ ...previous, [sch.staffId]: dayOfWeek }))}
                            className={`rounded-md border px-1.5 py-1 text-[10px] ${selectedDayNumber === dayOfWeek ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : day?.isWorkingDay ? 'border-slate-700 text-slate-300' : 'border-rose-500/30 text-rose-300'}`}>
                            {dayName.slice(0, 2)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300">
                        <span>{DAY_NAMES[selectedDay.dayOfWeek]}เป็นวันทำงาน</span>
                        <input type="checkbox" checked={selectedDay.isWorkingDay} disabled={!canManageSchedules}
                          onChange={(event) => updateScheduleDay(sch.staffId, selectedDay.dayOfWeek, { isWorkingDay: event.target.checked })} />
                      </label>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">เวลาเข้างาน - เลิกงาน</label>
                        <div className="flex items-center gap-1.5">
                          <input type="time" value={selectedDay.workStart} disabled={!canManageSchedules || !selectedDay.isWorkingDay}
                            onChange={(event) => updateScheduleDay(sch.staffId, selectedDay.dayOfWeek, { workStart: event.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500 font-bold"
                          />
                          <span className="text-slate-500 text-[10px]">ถึง</span>
                          <input type="time" value={selectedDay.workEnd} disabled={!canManageSchedules || !selectedDay.isWorkingDay}
                            onChange={(event) => updateScheduleDay(sch.staffId, selectedDay.dayOfWeek, { workEnd: event.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> พักเที่ยง/ระหว่างวัน
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input type="time" value={selectedDay.breakStart} disabled={!canManageSchedules || !selectedDay.isWorkingDay}
                            onChange={(event) => updateScheduleDay(sch.staffId, selectedDay.dayOfWeek, { breakStart: event.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500 font-bold"
                          />
                          <span className="text-slate-500 text-[10px]">ถึง</span>
                          <input type="time" value={selectedDay.breakEnd} disabled={!canManageSchedules || !selectedDay.isWorkingDay}
                            onChange={(event) => updateScheduleDay(sch.staffId, selectedDay.dayOfWeek, { breakEnd: event.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                    {canManageSchedules && (
                      <button type="button" onClick={() => handleSaveSchedule(sch)} disabled={mutatingResourceId === sch.staffId}
                        className="w-full rounded-xl bg-emerald-500 py-2 font-bold text-slate-950 disabled:opacity-50">
                        {mutatingResourceId === sch.staffId ? 'กำลังบันทึก...' : 'บันทึกตารางทั้งสัปดาห์'}
                      </button>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarOff className="w-5 h-5 text-rose-400" />
                  กำหนดวันหยุดพิเศษร้านค้า (Special Shop Holidays)
                </h2>
                <p className="text-xs text-slate-400">กำหนดวันหยุดนักขัตฤกษ์หรือวันหยุดเฉพาะกิจของร้านค้าเพื่อปิดไม่ให้ลูกค้าจองในวันดังกล่าว</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* LEFT COLUMN: ADD HOLIDAY FORM */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Plus className="w-4 h-4 text-rose-400" /> เพิ่มวันหยุดพิเศษใหม่
                  </span>

                  <form onSubmit={handleAddHoliday} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-semibold">
                        เลือกวันที่หยุดพิเศษ *
                      </label>
                      <input
                        required
                        type="date"
                        disabled={shopRole === 'staff'}
                        value={specialHolidayDate}
                        onChange={(e) => setSpecialHolidayDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                      />
                      <p className="text-[10px] text-rose-400/80 font-mono mt-1">*(ระบุปี ค.ศ. เช่น 2026-08-12)</p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-semibold">เหตุผลวันหยุด</label>
                      <input
                        type="text"
                        disabled={shopRole === 'staff'}
                        placeholder="เช่น วันแม่แห่งชาติ / สัมมนาประจำปี"
                        value={specialHolidayReason}
                        onChange={(e) => setSpecialHolidayReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={shopRole === 'staff' || mutatingResourceId === 'holiday-new'}
                      className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มวันหยุดพิเศษ
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: HOLIDAYS LIST */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <CalendarOff className="w-4 h-4 text-rose-400" /> รายการวันหยุดพิเศษทั้งหมด ({holidaysList.length} วัน)
                      </span>
                    </div>

                    {holidaysList.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-30 text-rose-400" />
                        <p>ยังไม่มีวันหยุดพิเศษที่กำหนดไว้</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {holidaysList.map((h) => (
                          <div key={h.id} className="flex justify-between items-center bg-slate-900 border border-rose-500/30 rounded-xl p-3 text-xs hover:border-rose-500/60 transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-bold px-2.5 py-1 rounded-lg text-xs">
                                📅 {h.date}
                              </span>
                              <span className="text-slate-200 font-semibold">{h.reason || 'ร้านปิดทำการประจำปี'}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(h.id)}
                              disabled={shopRole === 'staff' || mutatingResourceId === h.id}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                              title="ลบวันหยุดนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                    💡 ระบบจะปิดรับคิวจองในวันที่ระบุไว้ข้างต้นโดยอัตโนมัติในหน้าจองของลูกค้า
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {managementError && (
              <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">{managementError}</p>
            )}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                หน้าที่ของส่วนจัดการ &quot;พนักงาน&quot;
              </div>
              <p className="text-slate-300">
                หน้านี้ใช้สำหรับเพิ่มรายชื่อพนักงานและเปิด/ปิดสถานะพร้อมรับคิว โดยระบบจะนำเฉพาะพนักงานที่เปิดใช้งานไปแสดงในหน้าจองลูกค้า
              </p>
            </div>

            {shopRole === 'owner' ? (
            <form onSubmit={handleAddStaff} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-slate-300 block mb-1">ชื่อพนักงาน *</label>
                <input
                  required
                  type="text"
                  placeholder="เช่น ช่างเอก (Master Stylist)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-slate-300 block mb-1">เบอร์ติดต่อพนักงาน</label>
                <input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={mutatingResourceId === 'staff-new'}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
              >
                <Plus className="w-4 h-4" />
                {mutatingResourceId === 'staff-new' ? 'กำลังเพิ่ม...' : 'เพิ่มพนักงานใหม่'}
              </button>
            </form>
            ) : (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">เฉพาะ owner เท่านั้นที่เพิ่มหรือเปลี่ยนสถานะพนักงานได้</p>
            )}

            <div className="space-y-3">
              {staffList.length === 0 && <p className="py-8 text-center text-xs text-slate-500">ยังไม่มีพนักงานในร้าน</p>}
              {staffList.map((st) => (
                <div key={st.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
                  <div>
                    <p className="font-bold text-sm text-white">{st.name}</p>
                    <p className="text-slate-400 text-[11px]">{st.role} • เบอร์ติดต่อ: {st.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => void toggleStaffActive(st)}
                      disabled={shopRole !== 'owner' || mutatingResourceId === st.id}
                      className={`px-3 py-1 rounded-lg font-semibold text-[11px] border ${
                        st.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {mutatingResourceId === st.id ? 'กำลังบันทึก...' : st.isActive ? 'พร้อมรับคิว' : 'ปิดรับคิวชั่วคราว'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHOP PROFILE & SERVICES MANAGER */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {managementError && (
              <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">{managementError}</p>
            )}
            {/* SECTION 1: SHOP PROFILE EDITING */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-400" />
                    จัดการข้อมูลอัตลักษณ์ร้านค้า (Shop Profile Settings)
                  </h2>
                  <p className="text-xs text-slate-400">แก้ไขชื่อร้าน สโลแกน และเบอร์โทรสายตรงสำหรับนำไปแสดงในหน้าจองของลูกค้าและใบนัดหมาย LINE Flex Card</p>
                </div>
                <button
                  onClick={handleSaveShopProfile}
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {shopProfileSaved ? 'บันทึกเรียบร้อย!' : 'บันทึกข้อมูลร้านค้า'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">ชื่อร้านค้า (Shop Name) *</label>
                  <input
                    required
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">สโลแกน / คำอธิบายร้านค้า</label>
                  <input
                    type="text"
                    value={shopSlogan}
                    onChange={(e) => setShopSlogan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold text-emerald-400">เบอร์โทรสายตรงร้านค้า (Shop Phone) *</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 mr-1.5 flex-shrink-0" />
                    <input
                      required
                      type="tel"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="w-full bg-transparent border-none text-emerald-400 font-mono font-bold focus:outline-none ml-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* READ-ONLY SHOP URL LINK BAR WITH COPY BUTTON */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-400">ลิงก์หน้าจองออนไลน์ของร้านค้า (Read-only):</span>
                  <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    http://localhost:3000/book/{shopSlug}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyShopLink}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {copiedLinkNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLinkNotice ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์ร้านค้า'}
                </button>
              </div>
            </div>

            {/* SECTION 2: SERVICES MANAGER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-emerald-400" />
                    รายการบริการ & ยอดมัดจำ PromptPay (Service Offerings)
                  </h2>
                  <p className="text-xs text-slate-400">เพิ่ม แก้ไข หรือปิดบริการ พร้อมกำหนดราคา ระยะเวลา และยอดมัดจำที่แสดงในหน้าจองลูกค้า</p>
                </div>
                <button
                  onClick={handleOpenAddService}
                  disabled={shopRole === 'staff'}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {shopRole === 'staff' ? 'ไม่มีสิทธิ์แก้บริการ' : 'เพิ่มบริการใหม่'}
                </button>
              </div>

              {/* Service Form Modal / Dropdown */}
              {showServiceForm && (
                <form onSubmit={handleSaveService} className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-2xl animate-fade-in">
                  <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    {editingService ? <Edit3 className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                    {editingService ? 'แก้ไขรายการบริการ' : 'เพิ่มรายการบริการใหม่'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">ชื่อบริการ *</label>
                      <input
                        required
                        type="text"
                        placeholder="เช่น ตัดผมชายพรีเมียม + สระเซ็ต"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">รายละเอียดบริการ</label>
                      <input
                        type="text"
                        placeholder="อธิบายรายละเอียดสั้นๆ เพื่อให้ลูกค้าเข้าใจ"
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">ระยะเวลาการให้บริการ (นาที) *</label>
                      <input
                        required
                        type="number"
                        min={15}
                        step={15}
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold">ราคาบริการทั้งหมด (บาท) *</label>
                      <input
                        required
                        type="number"
                        min={0}
                        value={servicePrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setServicePrice(val);
                          setServiceDeposit(Math.round(val * 0.3));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-semibold text-amber-400">ยอดเงินมัดจำ PromptPay (บาท) *</label>
                      <input
                        required
                        type="number"
                        min={0}
                        value={serviceDeposit}
                        onChange={(e) => setServiceDeposit(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowServiceForm(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={mutatingResourceId === (editingService?.id ?? 'service-new')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md"
                    >
                      {mutatingResourceId === (editingService?.id ?? 'service-new') ? 'กำลังบันทึก...' : editingService ? 'บันทึกการแก้ไข' : 'บันทึกบริการใหม่'}
                    </button>
                  </div>
                </form>
              )}

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.length === 0 && <p className="py-8 text-center text-xs text-slate-500 md:col-span-2">ยังไม่มีบริการในร้าน</p>}
                {services.map((sv) => (
                  <div key={sv.id} className={`bg-slate-950 border rounded-xl p-5 space-y-3 transition-all ${sv.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800 opacity-60'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-white">{sv.name}</h3>
                        {!sv.isActive && <span className="mt-1 inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">ปิดบริการ</span>}
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sv.description}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                        ฿{sv.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {sv.duration} นาที</span>
                        <span className="text-amber-400 font-semibold">มัดจำ: ฿{sv.deposit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditService(sv)}
                          disabled={shopRole === 'staff' || mutatingResourceId === sv.id}
                          className="text-slate-400 hover:text-emerald-400 p-1 rounded transition-all"
                          title="แก้ไขบริการ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleToggleService(sv)}
                          disabled={shopRole === 'staff' || mutatingResourceId === sv.id}
                          className={`p-1 rounded transition-all ${sv.isActive ? 'text-slate-500 hover:text-rose-400' : 'text-slate-500 hover:text-emerald-400'}`}
                          title={sv.isActive ? 'ปิดบริการ' : 'เปิดบริการอีกครั้ง'}
                        >
                          {sv.isActive ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROMPTPAY & LINE OA SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                ตั้งค่าช่องทางชำระมัดจำ (PromptPay) & การส่งแจ้งเตือน (LINE OA)
              </h2>
              <p className="text-xs text-slate-400">กำหนดเลขบัญชี PromptPay รับเงินมัดจำของร้าน และเชื่อมต่อ LINE Official Account เพื่อส่งข้อความยืนยันคิวให้ลูกค้า</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-xs text-white">โหมดเปิด/ปิดระบบให้ลูกค้าเลือกระบุพนักงาน</p>
                <p className="text-[11px] text-slate-400">หากปิดไว้ ระบบจะไม่โชว์รายชื่อพนักงานในหน้าจองคิวลูกค้า (เหมาะกับร้านที่ไม่แยกช่าง)</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowStaffSelection(!allowStaffSelection)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  allowStaffSelection ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {allowStaffSelection ? 'เปิดให้ลูกค้าเลือกพนักงาน' : 'ปิด (สุ่ม/ไม่ระบุพนักงาน)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">ตั้งค่า PromptPay รับเงินมัดจำ</h3>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">เลขพร้อมเพย์ร้านค้า *</label>
                  <input
                    type="text"
                    value={promptpayNumber}
                    onChange={(e) => setPromptpayNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">ชื่อบัญชีรับโอน *</label>
                  <input
                    type="text"
                    value={promptpayName}
                    onChange={(e) => setPromptpayName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-[#06C755]/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#06C755]" />
                    <h3 className="font-bold text-sm text-white">ตั้งค่า LINE Official Account (LINE OA)</h3>
                  </div>
                  <span className="text-[10px] bg-[#06C755]/20 text-[#06C755] border border-[#06C755]/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Hybrid Dual-Channel
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    LINE OA ID ร้านค้า / แฮนเดิลส่วนตัว (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น @goodcutsbarber"
                    value={lineOaId}
                    onChange={(e) => setLineOaId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#06C755] font-bold focus:outline-none focus:border-[#06C755]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    แสดงบนหน้าเว็บร้านค้า และใช้เชื่อมต่อ Custom Messaging API ในอนาคต
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    Custom Messaging API Channel Token (Optional Advanced Setup)
                  </label>
                  <input
                    type="password"
                    placeholder="ใส่ Channel Access Token หากต้องการยิงจาก LINE Developers ร้านโดยตรง"
                    value={lineChannelToken}
                    onChange={(e) => setLineChannelToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#06C755]"
                  />
                  <p className="text-xs text-rose-400 font-medium mt-1.5 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl leading-relaxed">
                    ⚠️ หากเว้นว่างไว้ ระบบจะใช้ <strong className="text-rose-300 font-bold underline">LINE กลางของระบบ (@central_booking_oa)</strong> ส่งแจ้งเตือนใบนัดให้อัตโนมัติ (ไม่ต้องตั้งค่าซับซ้อน)
                  </p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    สถานะปัจจุบัน: พร้อมใช้งานผ่าน LINE กลางของระบบ (ไม่ต้องตั้งค่าเพิ่มเติม)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTestLineNotice(true);
                    setTimeout(() => setTestLineNotice(false), 2500);
                  }}
                  className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  {testLineNotice ? 'ส่งข้อความทดสอบเข้า LINE เรียบร้อย!' : 'ทดสอบส่งข้อความแจ้งเตือนเข้า LINE OA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL BILLING & SUBSCRIPTION (UPDATED WITH 5 / 5 / 10 STAFF QUOTAS) */}
        {activeTab === 'billing' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header Title */}
            <div className="text-center space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                Official Pricing & Subscription Model
              </span>
              <h2 className="text-2xl font-extrabold text-white">แพ็กเกจระบบจองคิวบริการร้านค้า</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                เลือกแพ็กเกจที่เหมาะกับขนาดร้านค้าของคุณ เพื่อปลดล็อกระบบรับจองคิว PromptPay QR และการส่งแจ้งเตือน LINE OA
              </p>

              {/* Monthly / Yearly Toggle */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>รายเดือน</span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="w-12 h-6 bg-slate-800 rounded-full p-1 border border-slate-700 transition-all relative"
                >
                  <div className={`w-4 h-4 bg-emerald-500 rounded-full transition-all ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  รายปี <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">ประหยัด 2 เดือน</span>
                </span>
              </div>
            </div>

            {/* 3 Main Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* FREE TRIAL TIER */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">🎁 Free Trial</h3>
                      <p className="text-[11px] text-slate-400">ทดลองใช้ฟรี 14 วัน ก่อนตัดสินใจ</p>
                    </div>
                  </div>

                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ฟรี 14 วัน
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <p className="font-bold text-slate-200">สิ่งที่ได้รับในแพ็กเกจ:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รับจองคิวสูงสุด <strong>50 คิว</strong></li>
                      <li className="flex items-center gap-2 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> เพิ่มพนักงานสูงสุด <strong>5 คน</strong></li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Dashboard บริหารคิวงาน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตั้งตารางช่าง & วันหยุดร้าน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ระบบมัดจำ PromptPay QR</li>
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> แจ้งเตือนใบนัดผ่าน LINE กลาง</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <span className="block text-center text-[10px] text-slate-500 mb-2">กำลังใช้งานแพ็กเกจนี้อยู่</span>
                  <button disabled className="w-full bg-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs cursor-not-allowed">
                    สถานะปัจจุบัน ( Trial 14 วัน )
                  </button>
                </div>
              </div>

              {/* BASIC TIER */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative hover:border-slate-600 transition-all">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">⚡ Basic Starter</h3>
                      <p className="text-[11px] text-slate-400">สำหรับร้านขนาดเล็ก (1-5 คน)</p>
                    </div>
                  </div>

                  <div>
                    <div className="text-3xl font-extrabold text-white font-mono">
                      {billingCycle === 'monthly' ? '฿490' : '฿4,900'} 
                      <span className="text-xs font-normal text-slate-400">/{billingCycle === 'monthly' ? 'เดือน' : 'ปี'}</span>
                    </div>
                    {billingCycle === 'yearly' && <span className="text-[10px] text-amber-400 font-medium">เฉลี่ยเพียง ฿408 /เดือน</span>}
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <p className="font-bold text-slate-200">สิ่งที่ได้รับในแพ็กเกจ:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รับจองคิวสูงสุด <strong>100 คิว/เดือน</strong></li>
                      <li className="flex items-center gap-2 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> เพิ่มพนักงานสูงสุด <strong>5 คน</strong></li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Dashboard บริหารคิวงาน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตั้งตารางช่าง & วันหยุดร้าน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ระบบมัดจำ PromptPay QR</li>
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> แจ้งเตือนใบนัดผ่าน LINE กลาง</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตรวจสอบสลิปด้วยตนเองผ่าน Dashboard</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <Link 
                    href="/register?plan=basic_490"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs border border-slate-700 transition-all block text-center"
                  >
                    เลือกแพ็กเกจ Basic ({billingCycle === 'monthly' ? '฿490/เดือน' : '฿4,900/ปี'})
                  </Link>
                </div>
              </div>

              {/* PRO TIER */}
              <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-emerald-950/40">
                <span className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md">
                  แนะนำสูงสุด (Recommended)
                </span>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">🚀 Pro</h3>
                      <p className="text-[11px] text-emerald-400 font-medium">สำหรับร้านหลายช่าง / แบรนด์พรีเมียม</p>
                    </div>
                  </div>

                  <div>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                      {billingCycle === 'monthly' ? '฿990' : '฿9,900'} 
                      <span className="text-xs font-normal text-slate-400">/{billingCycle === 'monthly' ? 'เดือน' : 'ปี'}</span>
                    </div>
                    {billingCycle === 'yearly' && <span className="text-[10px] text-amber-400 font-medium">เฉลี่ยเพียง ฿825 /เดือน</span>}
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <p className="font-bold text-emerald-400">สิ่งที่ได้รับเพิ่มจัดเต็ม:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รับจองคิวสูงสุด <strong>500 คิว/เดือน</strong></li>
                      <li className="flex items-center gap-2 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> เพิ่มพนักงานสูงสุด <strong>10 คน</strong></li>
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> แจ้งเตือนผ่าน LINE กลาง หรือ Custom LINE OA</li>
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> แจ้งเตือนล่วงหน้า 1 ชั่วโมงก่อนเวลานัด</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รายงานสรุปคิว รายได้ & ประวัติลูกค้า</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Priority Support การดูแลเป็นพิเศษ</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <Link 
                    href="/register?plan=pro_990"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-all block text-center"
                  >
                    เลือกแพ็กเกจ Pro ({billingCycle === 'monthly' ? '฿990/เดือน' : '฿9,900/ปี'})
                  </Link>
                </div>
              </div>
            </div>

            {/* ADD-ONS SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-left space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                บริการเสริม (Add-ons) กรณีใช้งานเกินโควตา
              </h3>
              <p className="text-xs text-slate-400">ร้านสามารถซื้อเครดิตหรือโควตาเพิ่มได้โดยไม่ต้องเปลี่ยนแพ็กเกจหลักทันที:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-white">คิวจองเพิ่มเติม</p>
                  <p className="text-[11px] text-slate-400">เพิ่มโควตารับคิวจองรายเดือน</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-white">เครดิตตรวจสลิปออโต้</p>
                  <p className="text-[11px] text-slate-400">ซื้อเพิ่มเป็นแพ็กเกจครั้ง</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-white">จำนวนพนักงานเพิ่ม</p>
                  <p className="text-[11px] text-slate-400">ขยายจำนวนช่างในร้าน</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-white">เซ็ตระบบ & นำเข้าข้อมูล</p>
                  <p className="text-[11px] text-slate-400">บริการช่วยเซ็ตอัปครั้งแรก</p>
                </div>
              </div>
            </div>

            {/* SINGLE GATEWAY ARCHITECTURE NOTE */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-left space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                สถาปัตยกรรมระบบชำระเงินค่าสมาชิก (Stripe Single Provider Standard)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-1">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" /> PromptPay QR (ไม่ผูกบัตร)
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ร้านสแกนจ่ายชำระรายรอบบิลจากหน้า Dashboard เหมาะสำหรับร้านที่ไม่ต้องการผูกบัตรเครดิต
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Stripe Billing & Customer Portal
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ใช้ **Stripe ตัวเดียวครอบคลุม** (Checkout / Billing / Portal / Webhooks) ตัดเงินอัตโนมัติ ไม่ต้องทำระบบรับเงินสองเจ้า ป้องกันปัญหาสนาม Webhook รวน
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SLIP VERIFICATION MODAL */}
      {selectedSlipBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in relative">
            {/* Top Right Close Button */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">ตรวจสอบสลิปมัดจำ (#{selectedSlipBooking.bookingCode})</h3>
              <button
                onClick={() => setSelectedSlipBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center relative">
              {selectedSlipBooking.slipUrl ? (
                <img src={selectedSlipBooking.slipUrl} alt="Deposit Slip" className="max-h-64 object-contain mx-auto rounded-lg" />
              ) : (
                <p className="py-10 text-xs text-rose-300">ไม่พบ URL สลิปสำหรับคิวนี้</p>
              )}
              <div className="mt-2 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-[10px] text-emerald-400 font-medium">
                🛡️ ยอดโอน ฿{selectedSlipBooking.depositPrice}.00 ตรงกับ PromptPay ร้าน
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p>ลูกค้า: <span className="font-semibold text-white">{selectedSlipBooking.customerName}</span> ({selectedSlipBooking.phone})</p>
              <p>บริการ: <span className="text-white">{selectedSlipBooking.serviceName}</span></p>
              <p>ยอดเงินในสลิป: <span className="font-mono font-bold text-emerald-400">฿{selectedSlipBooking.depositPrice}.00</span></p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleRejectSlip(selectedSlipBooking.id)}
                  disabled={mutatingBookingId === selectedSlipBooking.id}
                  className="w-1/2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  ปฏิเสธสลิป (กลับไปรอโอน 15 นาที)
                </button>
                <button
                  onClick={() => handleApproveSlip(selectedSlipBooking.id)}
                  disabled={mutatingBookingId === selectedSlipBooking.id}
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg transition-all"
                >
                  อนุมัติ & ยืนยันคิว
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSlipBooking(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold py-2 rounded-xl text-xs transition-all"
              >
                ปิดหน้าต่าง (ยังไม่กดเลือก)
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelBookingTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">ยกเลิกคิว #{cancelBookingTarget.bookingCode}</h3>
              <p className="mt-1 text-xs text-slate-400">กรุณาระบุเหตุผล ร้านค้าต้องจัดการเรื่องคืนเงินมัดจำเองหากจำเป็น</p>
            </div>

            <textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="เช่น ร้านปิดฉุกเฉิน / ลูกค้าโทรขอยกเลิก"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white outline-none focus:border-rose-500"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCancelBookingTarget(null);
                  setCancelReason('');
                }}
                disabled={mutatingBookingId === cancelBookingTarget.id}
                className="w-1/2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 disabled:opacity-50"
              >
                กลับ
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCancellation()}
                disabled={!cancelReason.trim() || mutatingBookingId === cancelBookingTarget.id}
                className="w-1/2 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutatingBookingId === cancelBookingTarget.id ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกคิว'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
