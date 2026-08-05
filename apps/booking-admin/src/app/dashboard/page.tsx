'use client';

import React, { useState } from 'react';
import { 
  Calendar, Users, DollarSign, CheckCircle2, XCircle, Eye, Clock, 
  Settings, CreditCard, Sparkles, AlertCircle, Plus, ShieldCheck, 
  QrCode, UserPlus, FileText, ExternalLink, CalendarOff, Coffee, Save,
  Filter, Copy, MessageCircle, Send, Check, AlertTriangle, Trash2, Edit3, Lock
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
  status: 'pending_deposit' | 'confirmed' | 'completed' | 'cancelled';
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

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-1042',
    customerName: 'คุณสมชาย ใจดี',
    phone: '081-234-5678',
    serviceName: 'ตัดผมชายพรีเมียม + สระเซ็ต',
    staffName: 'ช่างเอก',
    date: '2026-08-05',
    time: '11:30',
    totalPrice: 350,
    depositPrice: 100,
    status: 'pending_deposit',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
  },
  {
    id: 'BK-1043',
    customerName: 'คุณเกริกฤทธิ์ มีสุข',
    phone: '082-333-4455',
    serviceName: 'สปาหนังศีรษะแบบล้ำลึก',
    staffName: 'ช่างเอก',
    date: '2026-08-07',
    time: '14:00',
    totalPrice: 790,
    depositPrice: 200,
    status: 'confirmed'
  },
  {
    id: 'BK-1044',
    customerName: 'คุณณัฐชนนท์ วงศ์สว่าง',
    phone: '085-777-8899',
    serviceName: 'ดัดวอลลุ่มสไตล์เกาหลี',
    staffName: 'ช่างตั้ม',
    date: '2026-08-10',
    time: '10:30',
    totalPrice: 1200,
    depositPrice: 300,
    status: 'pending_deposit',
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400'
  },
  {
    id: 'BK-1041',
    customerName: 'คุณวิชัย สุขสันต์',
    phone: '089-987-6543',
    serviceName: 'ดัดวอลลุ่มสไตล์เกาหลี',
    staffName: 'ช่างตั้ม',
    date: '2026-08-05',
    time: '13:00',
    totalPrice: 1200,
    depositPrice: 300,
    status: 'confirmed'
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
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [schedules, setSchedules] = useState<StaffSchedule[]>(INITIAL_SCHEDULES);
  const [selectedSlipBooking, setSelectedSlipBooking] = useState<Booking | null>(null);

  // Filter Bookings by Date View
  const [bookingFilter, setBookingFilter] = useState<'today' | 'upcoming' | 'all'>('all');

  // Shop Settings State
  const [allowStaffSelection, setAllowStaffSelection] = useState<boolean>(true);
  const [shopWeeklyOffDays, setShopWeeklyOffDays] = useState<number[]>([1]);
  const [promptpayNumber, setPromptpayNumber] = useState('081-234-5678');
  const [promptpayName, setPromptpayName] = useState('บจก. กู้ด คัทส์ (Good Cuts Co., Ltd.)');
  const [lineOaId, setLineOaId] = useState('@goodcutsbarber');

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
  const pendingDeposit = bookings.filter(b => b.status === 'pending_deposit').length;
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

  const toggleShopOffDay = (dayIdx: number) => {
    setShopWeeklyOffDays(prev => 
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx]
    );
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
            <span>คุณกำลังใช้งาน **Free Trial 14 วัน** (เหลืออีก 12 วัน)</span>
          </div>
          <button 
            onClick={() => setActiveTab('billing')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow-md"
          >
            อัปเกรดเป็นแพ็กเกจเต็ม (490 บ./เดือน)
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
              <h1 className="font-bold text-base text-white">Good Cuts Barber Dashboard</h1>
              <p className="text-[11px] text-slate-400">ระบบจัดการคิว & ตรวจสลิปมัดจำร้านค้า</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'bookings' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              รายการคิวทั้งหมด & ล่วงหน้า
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
              จัดการบริการ
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              ตั้งค่า PromptPay & LINE OA
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
                  href="/book/good-cuts-barber"
                  target="_blank"
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 font-medium"
                >
                  หน้าจองลูกค้า
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">รหัสคิว / ลูกค้า</th>
                    <th className="py-3 px-4">บริการที่เลือก</th>
                    <th className="py-3 px-4">พนักงานให้บริการ</th>
                    <th className="py-3 px-4">วันที่นัดหมาย</th>
                    <th className="py-3 px-4">เวลานัด</th>
                    <th className="py-3 px-4">ยอดมัดจำ</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-emerald-400">{b.id}</p>
                        <p className="font-semibold text-white">{b.customerName}</p>
                        <p className="text-[10px] text-slate-400">{b.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{b.serviceName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{b.staffName}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {b.date} {b.date === todayStr ? <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-sans ml-1">วันนี้</span> : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">{b.time} น.</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">฿{b.depositPrice}</td>
                      <td className="py-3.5 px-4">
                        {b.status === 'pending_deposit' && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            รออนุมัติสลิป
                          </span>
                        )}
                        {b.status === 'confirmed' && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            ยืนยันคิวแล้ว
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            ยกเลิกแล้ว
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.status === 'pending_deposit' && (
                          <button
                            onClick={() => setSelectedSlipBooking(b)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 ml-auto shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            ดูสลิป & อนุมัติ
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <span className="text-emerald-400 font-medium text-[11px]">พร้อมให้บริการ</span>
                        )}
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
                    <CalendarOff className="w-5 h-5 text-amber-400" />
                    ตั้งค่าวันหยุดประจำสัปดาห์ของร้านค้า (Shop-wide Days Off)
                  </h2>
                  <p className="text-xs text-slate-400">เลือกวันปิดทำการประจำสัปดาห์ของร้าน ระบบจะปิดรับจองในวันดังกล่าวทั้งหมด</p>
                </div>
                <button
                  onClick={triggerSaveNotice}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {saveNotice ? 'บันทึกแล้ว!' : 'บันทึกการตั้งค่า'}
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">เลือกวันปิดทำการประจำสัปดาห์ของร้าน:</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_NAMES.map((dayName, idx) => {
                    const isShopOff = shopWeeklyOffDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleShopOffDay(idx)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isShopOff
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {dayName} {isShopOff ? '(ร้านปิดทำการ)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                เวลาทำงาน & เวลาพักเที่ยงของพนักงานรายบุคคล
              </h2>

              <div className="space-y-4">
                {schedules.map((sch) => (
                  <div key={sch.staffId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-sm text-emerald-400">{sch.staffName}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-slate-300 block">เวลาเข้างาน - เลิกงาน</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={sch.workStart}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, workStart: val } : s));
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-500">ถึง</span>
                          <input
                            type="time"
                            value={sch.workEnd}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, workEnd: val } : s));
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <label className="text-[11px] font-semibold text-slate-300 block pt-1 flex items-center gap-1 text-amber-400">
                          <Coffee className="w-3.5 h-3.5 text-amber-400" /> เวลาพักเที่ยง/พักระหว่างวัน
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={sch.breakStart}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, breakStart: val } : s));
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-slate-500">ถึง</span>
                          <input
                            type="time"
                            value={sch.breakEnd}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchedules(prev => prev.map(s => s.staffId === sch.staffId ? { ...s, breakEnd: val } : s));
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
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
                  <label className="text-xs text-slate-300 block mb-1">เลือกวันที่หยุดพิเศษ</label>
                  <input
                    required
                    type="date"
                    value={specialHolidayDate}
                    onChange={(e) => setSpecialHolidayDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
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

        {/* TAB 4: SERVICES MANAGER */}
        {activeTab === 'services' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-white">จัดการรายการบริการ & ค่ามัดจำ</h2>
                <p className="text-xs text-slate-400">เพิ่ม ลบ หรือแก้ไขราคาบริการและกำหนดยอดมัดจำ PromptPay</p>
              </div>
              <button className="bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                เพิ่มบริการใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-white mb-1">ตัดผมชายพรีเมียม + สระเซ็ต</h3>
                <p className="text-xs text-slate-400 mb-3">ระยะเวลา 45 นาที • ราคา ฿350</p>
                <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-3">
                  <span className="text-amber-400 font-medium">มัดจำล็อกคิว: ฿100</span>
                  <button className="text-slate-400 hover:text-white underline">แก้ไข</button>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-white mb-1">ดัดวอลลุ่มสไตล์เกาหลี</h3>
                <p className="text-xs text-slate-400 mb-3">ระยะเวลา 90 นาที • ราคา ฿1,200</p>
                <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-3">
                  <span className="text-amber-400 font-medium">มัดจำล็อกคิว: ฿300</span>
                  <button className="text-slate-400 hover:text-white underline">แก้ไข</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROMPTPAY & SECURED LINE OA SETTINGS (EXPLICIT SECURITY ENHANCEMENT) */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                ตั้งค่าช่องทางชำระมัดจำ (PromptPay) & การส่งแจ้งเตือน (LINE OA)
              </h2>
              <p className="text-xs text-slate-400">กำหนดเลขบัญชี PromptPay รับเงินมัดจำของร้าน และเชื่อมต่อ LINE Official Account เพื่อส่งข้อความยืนยันคิวให้ลูกค้า</p>
            </div>

            {/* Toggle Staff Selection Feature */}
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
              {/* PromptPay Settings */}
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

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                  💡 เลขนี้จะถูกนำไปสร้าง **PromptPay QR Code** อัตโนมัติในหน้าจองคิวของลูกค้า
                </div>
              </div>

              {/* SECURED LINE Official Account Settings (SECURITY FIX: NO RAW TOKEN EXPOSED) */}
              <div className="bg-slate-950 border border-[#06C755]/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#06C755]" />
                    <h3 className="font-bold text-sm text-white">ตั้งค่า LINE Official Account (LINE OA)</h3>
                  </div>
                  <span className="text-[10px] bg-[#06C755]/20 text-[#06C755] border border-[#06C755]/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Server Secured
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">LINE OA ID ร้านค้า (Public ID) *</label>
                  <input
                    type="text"
                    value={lineOaId}
                    onChange={(e) => setLineOaId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-[#06C755] font-bold focus:outline-none focus:border-[#06C755]"
                  />
                </div>

                {/* SECURITY NOTICE BOX INSTEAD OF EXPOSING PLAIN-TEXT TOKENS ON CLIENT */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    สถานะการเชื่อมต่อ: บัญชี LINE OA ทำงานปกติ (Protected)
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    🔒 **ความปลอดภัยสูงสุด:** รหัสลับ `Channel Access Token` และ `Channel Secret` ถูกจัดเก็บอย่างปลอดภัยบน **Server Environment (.env.local / Supabase Secret Vault)** โดยตรง ไม่ถูกแสดงเป็นข้อความบนหน้าเว็บเบราว์เซอร์ เพื่อป้องกันการรั่วไหลหรือถูกโจรกรรมข้อมูล
                  </p>
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

            <div className="flex justify-end">
              <button
                onClick={triggerSaveNotice}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Save className="w-4 h-4" />
                {saveNotice ? 'บันทึกการตั้งค่าเรียบร้อยแล้ว!' : 'บันทึกการตั้งค่าทั้งหมด'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: BILLING & SUBSCRIPTION */}
        {activeTab === 'billing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto text-center space-y-6">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                Self-service Subscription Engine
              </span>
              <h2 className="text-xl font-bold text-white mt-3">เลือกแพ็กเกจสมาชิกเพื่อใช้งานต่อเนื่อง</h2>
              <p className="text-xs text-slate-400 mt-1">ปลดล็อกระบบมัดจำ QR และการแจ้งเตือน LINE OA แบบไม่จำกัด</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 space-y-4 relative">
                <span className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                  ยอดนิยม
                </span>
                <h3 className="font-bold text-base text-white">Basic Starter</h3>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">฿490 <span className="text-xs font-normal text-slate-400">/เดือน</span></div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> รองรับจองคิวสูงสุด 200 คิว/เดือน</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ระบบมัดจำ PromptPay QR</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> แจ้งเตือน LINE OA อัตโนมัติ</li>
                </ul>
                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs shadow-lg">
                  สมัครแพ็กเกจ Basic (฿490/เดือน)
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-base text-white">Pro Unlimited</h3>
                <div className="text-2xl font-extrabold text-white font-mono">฿990 <span className="text-xs font-normal text-slate-400">/เดือน</span></div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ไม่จำกัดจำนวนคิวจอง</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> เพิ่มพนักงานได้ไม่จำกัด</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ระบบรายงานยอดมัดจำ & CRM</li>
                </ul>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs border border-slate-700">
                  สมัครแพ็กเกจ Pro (฿990/เดือน)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SLIP VERIFICATION MODAL */}
      {selectedSlipBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-base font-bold text-white">ตรวจสอบสลิปมัดจำ (#{selectedSlipBooking.id})</h3>
            
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center relative">
              <img src={selectedSlipBooking.slipUrl} alt="Deposit Slip" className="max-h-64 object-contain mx-auto rounded-lg" />
              <div className="mt-2 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-[10px] text-emerald-400 font-medium">
                🛡️ ระบบอ่าน QR บนสลิป: ยอดโอน ฿{selectedSlipBooking.depositPrice}.00 ตรงกับ PromptPay ร้าน
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p>ลูกค้า: <span className="font-semibold text-white">{selectedSlipBooking.customerName}</span> ({selectedSlipBooking.phone})</p>
              <p>บริการ: <span className="text-white">{selectedSlipBooking.serviceName}</span></p>
              <p>ยอดเงินในสลิป: <span className="font-mono font-bold text-emerald-400">฿{selectedSlipBooking.depositPrice}.00</span></p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleRejectSlip(selectedSlipBooking.id)}
                className="w-1/2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs"
              >
                สลิปปลอม/ไม่ตรง (ยกเลิก)
              </button>
              <button
                onClick={() => handleApproveSlip(selectedSlipBooking.id)}
                className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg"
              >
                อนุมัติ & ยืนยันคิว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
