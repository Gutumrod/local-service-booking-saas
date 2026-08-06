'use client';

import React, { useState } from 'react';
import { 
  Calendar, Users, DollarSign, CheckCircle2, XCircle, Eye, Clock, 
  Settings, CreditCard, Sparkles, AlertCircle, Plus, ShieldCheck, 
  QrCode, UserPlus, FileText, ExternalLink, CalendarOff, Coffee, Save,
  Filter, Copy, MessageCircle, Send, Check, AlertTriangle, Trash2, Edit3, Lock,
  Zap, HelpCircle, PackagePlus, Scissors, Store, Globe, Phone, X
} from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  totalPrice: number;
  depositPrice: number;
  status: 'hold' | 'pending_review' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'expired';
  depositStatus: 'not_required' | 'awaiting' | 'submitted' | 'verified' | 'rejected' | 'refunded';
  slipUrl?: string;
}

interface StaffSchedule {
  staffId: string;
  staffName: string;
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
  weeklyOffDays: number[];
}

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
}

const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'sv1', name: 'ตัดผมชายพรีเมียม + สระเซ็ต (Signature Haircut)', description: 'บริการตัดแต่งทรงผมอย่างประณีต พร้อมสระนวดผ่อนคลายและจัดทรงด้วยผลิตภัณฑ์นำเข้า', duration: 45, price: 350, deposit: 100 },
  { id: 'sv2', name: 'ดัดวอลลุ่มสไตล์เกาหลี (Korean Down Perm)', description: 'กดผมด้านข้าง ล็อกทรงวอลลุ่มธรรมชาติ ดูแลเส้นผมด้วยทรีตเมนต์บำรุง', duration: 90, price: 1200, deposit: 300 },
  { id: 'sv3', name: 'ทำสีผมพรีเมียม (Premium Hair Color)', description: 'ทำสีผมแฟชั่น/ปกปิดผมขาว พร้อมทรีตเมนต์เคลือบเงาป้องกันผมเสีย', duration: 120, price: 1800, deposit: 500 },
  { id: 'sv4', name: 'สปาหนังศีรษะแบบล้ำลึก (Deep Scalp Treatment)', description: 'ดีท็อกซ์หนังศีรษะ ขจัดความมันและรังแค พร้อมนวดผ่อนคลายความเครียด', duration: 60, price: 790, deposit: 200 }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-7K2M9Q',
    customerName: 'คุณสมชาย ใจดี',
    phone: '081-234-5678',
    serviceName: 'ตัดผมชายพรีเมียม + สระเซ็ต',
    staffName: 'ช่างเอก',
    date: '2026-08-05',
    time: '11:30',
    totalPrice: 350,
    depositPrice: 100,
    status: 'pending_review',
    depositStatus: 'submitted',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
  },
  {
    id: 'BK-8P3R1W',
    customerName: 'คุณเกริกฤทธิ์ มีสุข',
    phone: '082-333-4455',
    serviceName: 'สปาหนังศีรษะแบบล้ำลึก',
    staffName: 'ช่างเอก',
    date: '2026-08-07',
    time: '14:00',
    totalPrice: 790,
    depositPrice: 200,
    status: 'confirmed',
    depositStatus: 'verified'
  },
  {
    id: 'BK-9M4L2X',
    customerName: 'คุณณัฐชนนท์ วงศ์สว่าง',
    phone: '085-777-8899',
    serviceName: 'ดัดวอลลุ่มสไตล์เกาหลี',
    staffName: 'ช่างตั้ม',
    date: '2026-08-10',
    time: '10:30',
    totalPrice: 1200,
    depositPrice: 300,
    status: 'pending_review',
    depositStatus: 'submitted',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
  },
  {
    id: 'BK-5A6B7C',
    customerName: 'คุณวิชัย สุขสันต์',
    phone: '089-987-6543',
    serviceName: 'ดัดวอลลุ่มสไตล์เกาหลี',
    staffName: 'ช่างตั้ม',
    date: '2026-08-05',
    time: '13:00',
    totalPrice: 1200,
    depositPrice: 300,
    status: 'confirmed',
    depositStatus: 'verified'
  }
];

const INITIAL_STAFF: StaffMember[] = [
  { id: 'st1', name: 'ช่างเอก (Master Stylist)', phone: '081-111-2222', role: 'ช่างผมอาศด', isActive: true },
  { id: 'st2', name: 'ช่างตั้ม (Fade Specialist)', phone: '082-222-3333', role: 'ช่างวินเทจเฟด', isActive: true },
  { id: 'st3', name: 'ช่างบิว (Color Expert)', phone: '083-333-4444', role: 'ช่างเคมีทำสี', isActive: true }
];

const INITIAL_SCHEDULES: StaffSchedule[] = [
  { staffId: 'st1', staffName: 'ช่างเอก', workStart: '10:00', workEnd: '19:00', breakStart: '12:00', breakEnd: '13:00', weeklyOffDays: [1] },
  { staffId: 'st2', staffName: 'ช่างตั้ม', workStart: '10:00', workEnd: '19:00', breakStart: '13:00', breakEnd: '14:00', weeklyOffDays: [2] },
  { staffId: 'st3', staffName: 'ช่างบิว', workStart: '11:00', workEnd: '20:00', breakStart: '14:00', breakEnd: '15:00', weeklyOffDays: [3] }
];

const DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedules' | 'services' | 'staff' | 'settings' | 'billing'>('bookings');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [schedules, setSchedules] = useState<StaffSchedule[]>(INITIAL_SCHEDULES);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [selectedSlipBooking, setSelectedSlipBooking] = useState<Booking | null>(null);

  // Shop Profile State
  const [shopName, setShopName] = useState('Good Cuts Barber');
  const [shopSlogan, setShopSlogan] = useState('ร้านตัดผมชายพรีเมียม & สปาหนังศีรษะ');
  const [shopPhone, setShopPhone] = useState('081-234-5678');
  const [shopSlug, setShopSlug] = useState('good-cuts-barber');
  const [shopProfileSaved, setShopProfileSaved] = useState(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);

  // Shop Operating Hours State (General Opening / Closing Time)
  const [shopOpenTime, setShopOpenTime] = useState('09:00');
  const [shopCloseTime, setShopCloseTime] = useState('20:00');

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
  const [shopWeeklyOffDays, setShopWeeklyOffDays] = useState<number[]>([1]);
  const [promptpayNumber, setPromptpayNumber] = useState('081-234-5678');
  const [promptpayName, setPromptpayName] = useState('บจก. กู้ด คัทส์ (Good Cuts Co., Ltd.)');
  const [lineOaId, setLineOaId] = useState('@goodcutsbarber');
  const [lineChannelToken, setLineChannelToken] = useState('');

  // Special Holidays
  const [specialHolidayDate, setSpecialHolidayDate] = useState('');
  const [specialHolidayReason, setSpecialHolidayReason] = useState('');
  const [holidaysList, setHolidaysList] = useState<{ date: string; reason: string }[]>([
    { date: '2026-08-12', reason: 'วันแม่แห่งชาติ (ร้านปิดทำการประจำปี)' }
  ]);

  // Modals & Notices
  const [saveNotice, setSaveNotice] = useState(false);
  const [testLineNotice, setTestLineNotice] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Stats
  const todayStr = '2026-08-05';
  const totalToday = bookings.filter(b => b.date === todayStr).length;
  const totalUpcoming = bookings.filter(b => b.date > todayStr).length;
  const pendingDeposit = bookings.filter(b => b.status === 'pending_review').length;
  const depositCollected = bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.depositPrice : 0), 0);

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'today') return b.date === todayStr;
    if (bookingFilter === 'upcoming') return b.date > todayStr;
    return true;
  });

  const handleApproveSlip = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    setSelectedSlipBooking(null);
  };

  const handleRejectSlip = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    setSelectedSlipBooking(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const toggleShopOffDay = (dayIdx: number) => {
    setShopWeeklyOffDays(prev => 
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx]
    );
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

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const newSt: StaffMember = {
      id: `st${staffList.length + 1}`,
      name: newStaffName,
      phone: newStaffPhone || '08X-XXX-XXXX',
      role: 'พนักงานให้บริการทั่วไป',
      isActive: true
    };
    setStaffList(prev => [...prev, newSt]);
    setNewStaffName('');
    setNewStaffPhone('');
  };

  const toggleStaffActive = (staffId: string) => {
    setStaffList(prev => prev.map(st => st.id === staffId ? { ...st, isActive: !st.isActive } : st));
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialHolidayDate) return;
    setHolidaysList(prev => [...prev, { date: specialHolidayDate, reason: specialHolidayReason || 'วันหยุดพิเศษร้านค้า' }]);
    setSpecialHolidayDate('');
    setSpecialHolidayReason('');
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

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;

    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? {
        ...s,
        name: serviceName,
        description: serviceDesc,
        duration: serviceDuration,
        price: servicePrice,
        deposit: serviceDeposit
      } : s));
    } else {
      const newSv: ServiceItem = {
        id: `sv${services.length + 1}`,
        name: serviceName,
        description: serviceDesc || 'บริการคุณภาพสูงจากทางร้าน',
        duration: serviceDuration,
        price: servicePrice,
        deposit: serviceDeposit
      };
      setServices(prev => [...prev, newSv]);
    }

    setShowServiceForm(false);
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const triggerSaveNotice = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
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
          <button 
            onClick={() => setActiveTab('billing')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow-md"
          >
            อัปเกรดเป็นแพ็กเกจเต็ม (เริ่มต้น 490 บ./เดือน)
          </button>
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
                  href={`/book/${shopSlug}`}
                  target="_blank"
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
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-4 px-4">
                        <p className="font-mono font-bold text-emerald-400 text-sm">{b.id}</p>
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
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md"
                            >
                              <Eye className="w-4 h-4" />
                              ดูสลิป & อนุมัติ
                            </button>
                          )}
                          {b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'expired' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
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
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    การตั้งค่าเวลาเปิด-ปิด & วันหยุดประจำสัปดาห์ของร้านค้า
                  </h2>
                  <p className="text-xs text-slate-400">กำหนดกรอบเวลาเปิดทำการและวันปิดทำการประจำสัปดาห์ของร้านค้าเพื่อใช้คำนวณคิวจองอัตโนมัติ</p>
                </div>
                <button
                  onClick={triggerSaveNotice}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {saveNotice ? 'บันทึกแล้ว!' : 'บันทึกการตั้งค่าร้านค้า'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> เวลาเปิด - ปิดทำการทั่วไปของร้านค้า
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 font-semibold">เวลาเปิดร้าน *</label>
                      <input
                        type="time"
                        value={shopOpenTime}
                        onChange={(e) => setShopOpenTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1 font-semibold">เวลาปิดร้าน *</label>
                      <input
                        type="time"
                        value={shopCloseTime}
                        onChange={(e) => setShopCloseTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">สล็อตเวลารับจองคิวจะถูกจำกัดอยู่ในช่วงเวลานี้เสมอ</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                    <CalendarOff className="w-4 h-4 text-rose-400" /> วันหยุดประจำสัปดาห์ของร้านค้า (Shop-wide Off)
                  </span>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DAY_NAMES.map((dayName, idx) => {
                      const isShopOff = shopWeeklyOffDays.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleShopOffDay(idx)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isShopOff
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dayName} {isShopOff ? '(ปิด)' : ''}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500">วันทำการที่ถูกเลือกปิด จะไม่เปิดให้ลูกค้าจองคิวในทุกกรณี</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                เวลาทำงาน & เวลาพักเที่ยงของพนักงานรายบุคคล
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schedules.map((sch) => (
                  <div key={sch.staffId} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
                    <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-400">{sch.staffName}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">เวลาเข้างาน - เลิกงาน</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={sch.workStart}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, workStart: val } : s));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500 font-bold"
                          />
                          <span className="text-slate-500 text-[10px]">ถึง</span>
                          <input
                            type="time"
                            value={sch.workEnd}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, workEnd: val } : s));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> พักเที่ยง/ระหว่างวัน
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={sch.breakStart}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, breakStart: val } : s));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500 font-bold"
                          />
                          <span className="text-slate-500 text-[10px]">ถึง</span>
                          <input
                            type="time"
                            value={sch.breakEnd}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, breakEnd: val } : s));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <CalendarOff className="w-5 h-5 text-rose-400" />
                กำหนดวันหยุดพิเศษร้านค้า (Special Shop Holidays)
              </h2>
              <p className="text-xs text-slate-400 mb-4">กำหนดวันหยุดนักขัตฤกษ์หรือวันหยุดเฉพาะกิจของร้านค้าเพื่อปิดไม่ให้ลูกค้าจองในวันดังกล่าว</p>

              <form onSubmit={handleAddHoliday} className="flex flex-wrap gap-3 items-end mb-6">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    เลือกวันที่หยุดพิเศษ <span className="text-rose-400 font-mono">(ระบุปี ค.ศ. เช่น 2026-08-12)</span> *
                  </label>
                  <input
                    required
                    type="date"
                    value={specialHolidayDate}
                    onChange={(e) => setSpecialHolidayDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-slate-300 block mb-1">เหตุผลวันหยุด</label>
                  <input
                    type="text"
                    placeholder="เช่น วันแม่แห่งชาติ / สัมมนาประจำปี"
                    value={specialHolidayReason}
                    onChange={(e) => setSpecialHolidayReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มวันหยุดพิเศษ
                </button>
              </form>

              <div className="space-y-2">
                {holidaysList.map((h, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-950 border border-rose-500/30 rounded-xl px-4 py-2.5 text-xs">
                    <span className="font-mono text-rose-400 font-bold">{h.date}</span>
                    <span className="text-slate-300">{h.reason}</span>
                    <button
                      onClick={() => setHolidaysList(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                หน้าที่ของส่วนจัดการ "พนักงาน"
              </div>
              <p className="text-slate-300">
                หน้านี้ใช้สำหรับ **เพิ่ม/ลบรายชื่อพนักงานในร้าน** และ **เปิด/ปิดสถานะพร้อมปฏิบัติงาน** โดยระบบจะนำรายชื่อพนักงานไปแสดงให้ลูกค้าเลือกจองคิวบนมือถือ (หากเปิดโหมดให้เลือกพนักงาน)
              </p>
            </div>

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
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
              >
                <Plus className="w-4 h-4" />
                เพิ่มพนักงานใหม่
              </button>
            </form>

            <div className="space-y-3">
              {staffList.map((st) => (
                <div key={st.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
                  <div>
                    <p className="font-bold text-sm text-white">{st.name}</p>
                    <p className="text-slate-400 text-[11px]">{st.role} • เบอร์ติดต่อ: {st.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStaffActive(st.id)}
                      className={`px-3 py-1 rounded-lg font-semibold text-[11px] border ${
                        st.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {st.isActive ? 'พร้อมรับคิว' : 'ปิดรับคิวชั่วคราว'}
                    </button>
                    <button 
                      onClick={() => setStaffList(prev => prev.filter(s => s.id !== st.id))}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  <p className="text-xs text-slate-400">เพิ่ม ลบ หรือแก้ไขราคาบริการ ระยะเวลา และยอดเงินมัดจำที่จะนำไปแสดงในหน้าจองลูกค้า</p>
                </div>
                <button
                  onClick={handleOpenAddService}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มบริการใหม่
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
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md"
                    >
                      {editingService ? 'บันทึกการแก้ไข' : 'บันทึกบริการใหม่'}
                    </button>
                  </div>
                </form>
              )}

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((sv) => (
                  <div key={sv.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-white">{sv.name}</h3>
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
                          className="text-slate-400 hover:text-emerald-400 p-1 rounded transition-all"
                          title="แก้ไขบริการ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(sv.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-all"
                          title="ลบบริการ"
                        >
                          <Trash2 className="w-4 h-4" />
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
                  <p className="text-[10px] text-slate-500 mt-1">
                    หากเว้นว่างไว้ ระบบจะใช้ <strong>Central LINE Bot (@central_booking_oa)</strong> ยิงแจ้งเตือนใบนัดให้ฟรี 0-Friction
                  </p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    สถานะปัจจุบัน: พร้อมใช้งานผ่าน Central LINE Bot (0-Friction)
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
                    <p className="font-bold text-slate-200">สิ่งที่ได้รับ:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รับจองคิวสูงสุด <strong>50 คิว</strong></li>
                      <li className="flex items-center gap-2 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> เพิ่มพนักงานสูงสุด <strong>5 คน</strong></li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Dashboard บริหารคิวงาน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตั้งตารางช่าง & วันหยุดร้าน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ระบบมัดจำ PromptPay QR</li>
                      <li className="flex items-center gap-2 text-amber-300 font-semibold"><Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> แจ้งเตือน LINE OA (ทดลองใช้)</li>
                      <li className="flex items-center gap-2 text-amber-300 font-semibold"><Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> ตรวจสลิปออโต้ (ทดลอง 10 ครั้ง)</li>
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
                    <p className="font-bold text-slate-200">สิ่งที่ได้รับ:</p>
                    <ul className="space-y-2 text-[11px]">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รับจองคิวสูงสุด <strong>100 คิว/เดือน</strong></li>
                      <li className="flex items-center gap-2 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> เพิ่มพนักงานสูงสุด <strong>5 คน</strong></li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Dashboard บริหารคิวงาน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตั้งตารางช่าง & วันหยุดร้าน</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ระบบมัดจำ PromptPay QR</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตรวจสอบสลิปด้วยตนเองผ่าน Dashboard</li>
                      <li className="flex items-center gap-2 text-rose-400 line-through opacity-70"><XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> แจ้งเตือน LINE OA อัตโนมัติ</li>
                      <li className="flex items-center gap-2 text-rose-400 line-through opacity-70"><XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> ระบบตรวจสอบสลิปอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs border border-slate-700 transition-all">
                    เลือกแพ็กเกจ Basic ({billingCycle === 'monthly' ? '฿490/เดือน' : '฿4,900/ปี'})
                  </button>
                </div>
              </div>

              {/* PRO TIER */}
              <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-emerald-950/40">
                <span className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md">
                  คุ้มค่าที่สุด (Recommended)
                </span>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">🚀 Pro</h3>
                      <p className="text-[11px] text-emerald-400 font-medium">สำหรับร้านหลายช่าง / ลดงานแอดมิน</p>
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
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> แจ้งเตือนผ่าน LINE OA อัตโนมัติ</li>
                      <li className="flex items-center gap-2 text-emerald-300 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ตรวจสลิปอัตโนมัติ <strong>100 ครั้ง/เดือน</strong></li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> ส่งข้อความแจ้งเตือนก่อนถึงวันนัด</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> รายงานสรุปคิว รายได้ & ประวัติลูกค้า</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-950/40 transition-all">
                    เลือกแพ็กเกจ Pro ({billingCycle === 'monthly' ? '฿990/เดือน' : '฿9,900/ปี'})
                  </button>
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
              <h3 className="text-base font-bold text-white">ตรวจสอบสลิปมัดจำ (#{selectedSlipBooking.id})</h3>
              <button
                onClick={() => setSelectedSlipBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center relative">
              <img src={selectedSlipBooking.slipUrl} alt="Deposit Slip" className="max-h-64 object-contain mx-auto rounded-lg" />
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
                  className="w-1/2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs transition-all"
                >
                  สลิปปลอม/ไม่ตรง (ยกเลิก)
                </button>
                <button
                  onClick={() => handleApproveSlip(selectedSlipBooking.id)}
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
    </div>
  );
}
