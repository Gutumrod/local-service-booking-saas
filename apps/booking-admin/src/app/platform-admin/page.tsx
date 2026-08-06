'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store, Users, CreditCard, MessageCircle, AlertTriangle, ShieldCheck, 
  Sparkles, DollarSign, Activity, CheckCircle2, XCircle, Search, 
  Plus, Edit3, Lock, Server, BarChart3, RefreshCw, Layers, ArrowUpRight,
  Clock, PhoneCall, Check, X, Eye, Filter, UserCheck, UserX, Building
} from 'lucide-react';

interface TenantShop {
  id: string;
  name: string;
  slug: string;
  category?: string;
  ownerName: string;
  ownerPhone: string;
  promptpayNumber?: string;
  plan: 'free_trial' | 'basic_490' | 'pro_990';
  status: 'active' | 'pending_approval' | 'past_due' | 'cancelled' | 'suspended';
  trialEndsAt: string;
  nextBillingDate: string;
  bookingsThisMonth: number;
  maxBookingsQuota: number;
  topupBookings: number;
  lineMessagesThisMonth: number;
  lineChannelType: 'central' | 'custom';
  createdAt: string;
}

const INITIAL_TENANT_SHOPS: TenantShop[] = [
  {
    id: 'shp_pending_1',
    name: 'Barber Shop BKK 88',
    slug: 'barber-shop-bkk-88',
    category: 'ร้านตัดผม / บาร์เบอร์',
    ownerName: 'คุณเอกชัย วิเศษสรรค์',
    ownerPhone: '089-777-6655',
    promptpayNumber: '0897776655',
    plan: 'basic_490',
    status: 'pending_approval',
    trialEndsAt: '2026-08-20',
    nextBillingDate: '2026-08-20',
    bookingsThisMonth: 0,
    maxBookingsQuota: 100,
    topupBookings: 0,
    lineMessagesThisMonth: 0,
    lineChannelType: 'central',
    createdAt: '2026-08-06 18:30'
  },
  {
    id: 'shp_pending_2',
    name: 'Luxury Lash & Spa Studio',
    slug: 'luxury-lash-spa-studio',
    category: 'ร้านทำเล็บ / ต่อขนตา / สปา',
    ownerName: 'คุณกนกวรรณ รุ่งเรือง',
    ownerPhone: '081-444-3322',
    promptpayNumber: '0814443322',
    plan: 'pro_990',
    status: 'pending_approval',
    trialEndsAt: '2026-08-20',
    nextBillingDate: '2026-08-20',
    bookingsThisMonth: 0,
    maxBookingsQuota: 500,
    topupBookings: 0,
    lineMessagesThisMonth: 0,
    lineChannelType: 'central',
    createdAt: '2026-08-06 19:15'
  },
  {
    id: 'shp_1',
    name: 'Good Cuts Barber',
    slug: 'good-cuts-barber',
    category: 'ร้านตัดผมชายพรีเมียม',
    ownerName: 'คุณสมชาย ใจดี',
    ownerPhone: '081-234-5678',
    promptpayNumber: '0800742005',
    plan: 'free_trial',
    status: 'active',
    trialEndsAt: '2026-08-19',
    nextBillingDate: '2026-08-19',
    bookingsThisMonth: 12,
    maxBookingsQuota: 50,
    topupBookings: 0,
    lineMessagesThisMonth: 36,
    lineChannelType: 'central',
    createdAt: '2026-08-01 10:00'
  },
  {
    id: 'shp_2',
    name: 'Glamour Hair Studio',
    slug: 'glamour-hair-studio',
    category: 'ซาลอนทำผม & ทำสี',
    ownerName: 'คุณศิริพร บุญมา',
    ownerPhone: '082-999-8877',
    promptpayNumber: '0829998877',
    plan: 'pro_990',
    status: 'active',
    trialEndsAt: '2026-05-10',
    nextBillingDate: '2026-09-10',
    bookingsThisMonth: 340,
    maxBookingsQuota: 500,
    topupBookings: 100,
    lineMessagesThisMonth: 1020,
    lineChannelType: 'custom',
    createdAt: '2026-05-10 14:20'
  },
  {
    id: 'shp_3',
    name: 'Vintage Barber & Spa',
    slug: 'vintage-barber-spa',
    category: 'บาร์เบอร์วินเทจ',
    ownerName: 'คุณธีรพงษ์ วงศ์สว่าง',
    ownerPhone: '085-111-2233',
    promptpayNumber: '0851112233',
    plan: 'basic_490',
    status: 'active',
    trialEndsAt: '2026-06-01',
    nextBillingDate: '2026-09-01',
    bookingsThisMonth: 92,
    maxBookingsQuota: 100,
    topupBookings: 0,
    lineMessagesThisMonth: 276,
    lineChannelType: 'central',
    createdAt: '2026-06-01 09:15'
  },
  {
    id: 'shp_4',
    name: 'Clean Detailing Garage',
    slug: 'clean-detailing-garage',
    category: 'คาร์แคร์ & เคลือบแก้ว',
    ownerName: 'คุณอัครเดช รุ่งเรือง',
    ownerPhone: '089-444-5566',
    promptpayNumber: '0894445566',
    plan: 'free_trial',
    status: 'cancelled',
    trialEndsAt: '2026-07-20',
    nextBillingDate: '2026-07-20',
    bookingsThisMonth: 48,
    maxBookingsQuota: 50,
    topupBookings: 0,
    lineMessagesThisMonth: 144,
    lineChannelType: 'central',
    createdAt: '2026-07-06 11:30'
  }
];

export default function PlatformSuperAdminPage() {
  const [shops, setShops] = useState<TenantShop[]>(INITIAL_TENANT_SHOPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'active' | 'pending' | 'cancelled' | 'all'>('active');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free_trial' | 'basic_490' | 'pro_990'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Status counters
  const pendingShopsCount = shops.filter(s => s.status === 'pending_approval').length;
  const activeShopsCount = shops.filter(s => s.status === 'active').length;
  const cancelledShopsCount = shops.filter(s => s.status === 'cancelled' || s.status === 'suspended').length;
  const totalShopsCount = shops.length;

  // Revenue Metrics
  const proSubscribers = shops.filter(s => s.status === 'active' && s.plan === 'pro_990').length;
  const basicSubscribers = shops.filter(s => s.status === 'active' && s.plan === 'basic_490').length;
  const mrr = (proSubscribers * 990) + (basicSubscribers * 490);

  // Central LINE OA Usage
  const totalCentralLineMessages = shops
    .filter(s => s.lineChannelType === 'central')
    .reduce((sum, s) => sum + s.lineMessagesThisMonth, 0);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Actions
  const handleApproveShop = (shopId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id === shopId) {
        triggerNotice(`🟢 อนุมัติเปิดใช้งานร้าน "${s.name}" เรียบร้อยแล้ว!`);
        return { ...s, status: 'active' };
      }
      return s;
    }));
  };

  const handleRejectShop = (shopId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id === shopId) {
        triggerNotice(`🔴 ปฏิเสธคำขอสมัครร้าน "${s.name}" เรียบร้อยแล้ว`);
        return { ...s, status: 'cancelled' };
      }
      return s;
    }));
  };

  const handleUpdatePlan = (shopId: string, newPlan: 'free_trial' | 'basic_490' | 'pro_990') => {
    setShops(prev => prev.map(s => {
      if (s.id === shopId) {
        const maxQuota = newPlan === 'pro_990' ? 500 : newPlan === 'basic_490' ? 100 : 50;
        return { ...s, plan: newPlan, maxBookingsQuota: maxQuota };
      }
      return s;
    }));
    triggerNotice('อัปเดตแพ็กเกจร้านค้าเรียบร้อยแล้ว');
  };

  const handleAddTopupBookings = (shopId: string, amount: number = 100) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, topupBookings: s.topupBookings + amount } : s));
    triggerNotice(`เติมโควตาเสริม +${amount} คิว เรียบร้อยแล้ว`);
  };

  const handleExtendDays = (shopId: string, days: number = 14) => {
    setShops(prev => prev.map(s => {
      if (s.id === shopId) {
        const currentDate = new Date(s.nextBillingDate.split(' ')[0] || '2026-08-19');
        currentDate.setDate(currentDate.getDate() + days);
        const newDateStr = currentDate.toISOString().split('T')[0];
        return { ...s, nextBillingDate: newDateStr, trialEndsAt: newDateStr };
      }
      return s;
    }));
    triggerNotice(`ขยายเวลาแพ็กเกจ +${days} วัน เรียบร้อยแล้ว`);
  };

  const handleToggleShopStatus = (shopId: string) => {
    setShops(prev => prev.map(s => {
      if (s.id === shopId) {
        const nextStatus = s.status === 'active' ? 'cancelled' : 'active';
        triggerNotice(nextStatus === 'cancelled' ? `ระงับบริการร้าน ${s.name} เรียบร้อยแล้ว` : `เปิดคืนบริการร้าน ${s.name} เรียบร้อยแล้ว`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Filtered Shops List according to active status tab
  const filteredShops = shops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || s.plan === filterPlan;

    if (!matchesSearch || !matchesPlan) return false;

    if (statusTab === 'active') {
      return s.status === 'active' || s.status === 'pending_approval';
    }
    if (statusTab === 'pending') {
      return s.status === 'pending_approval';
    }
    if (statusTab === 'cancelled') {
      return s.status === 'cancelled' || s.status === 'suspended';
    }
    return true; // 'all'
  });

  const pendingList = shops.filter(s => s.status === 'pending_approval');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Super Admin Top Bar */}
      <header className="bg-slate-900 border-b border-purple-500/30 px-6 py-3.5 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-white">Platform Super Admin (CEO Control Center)</h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  Khun Free CEO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">อนุมัติร้านค้าใหม่ • บริหารแพ็กเกจ SaaS • มอนิเตอร์ Central LINE OA Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {notice && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-semibold animate-fade-in">
                {notice}
              </span>
            )}
            <Link
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl font-medium border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              สลับไปหน้า Dashboard ร้านค้า
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* PENDING APPROVAL ALERT BANNER (IF ANY) */}
        {pendingShopsCount > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center border border-amber-500/50">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-amber-300 flex items-center gap-2">
                    ⚠️ คิวร้านค้าใหม่รอการอนุมัติเปิดใช้งาน ({pendingShopsCount} ร้านค้า)
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    โปรดตรวจสอบข้อมูลร้านค้า เบอร์โทร และเลขพร้อมเพย์ ก่อนกดอนุมัติให้ระบบเปิดหน้าจองคิวออนไลน์
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusTab('pending')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
              >
                ดูคิวรออนุมัติทั้งหมด ({pendingShopsCount})
              </button>
            </div>

            {/* Quick Cards Grid for Pending Approval */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {pendingList.map(shop => (
                <div key={shop.id} className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                          {shop.createdAt}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{shop.name}</h4>
                        <p className="text-xs text-emerald-400 font-mono">/book/{shop.slug}</p>
                      </div>
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-semibold">
                        {shop.plan === 'pro_990' ? '🚀 Pro 990' : shop.plan === 'basic_490' ? '⚡ Basic 490' : '🎁 Free Trial'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                      <p><strong className="text-slate-400">ประเภทธุรกิจ:</strong> {shop.category || 'ไม่ระบุ'}</p>
                      <p><strong className="text-slate-400">เจ้าของร้าน:</strong> {shop.ownerName} (<a href={`tel:${shop.ownerPhone}`} className="text-amber-300 underline font-mono">{shop.ownerPhone}</a>)</p>
                      <p><strong className="text-slate-400">PromptPay:</strong> <span className="font-mono text-emerald-400">{shop.promptpayNumber}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleApproveShop(shop.id)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      อนุมัติเปิดใช้งาน
                    </button>
                    <button
                      onClick={() => handleRejectShop(shop.id)}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* MRR Card */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">รายได้ประจำเดือน (MRR)</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">฿{mrr.toLocaleString()}.00</p>
            <p className="text-[11px] text-emerald-400 mt-1">จาก Basic ({basicSubscribers}) + Pro ({proSubscribers}) ร้านค้า</p>
          </div>

          {/* Active Shops Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">ร้านค้าเปิดใช้งานอยู่</span>
              <Store className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeShopsCount} <span className="text-xs font-normal text-slate-400">/ {totalShopsCount} ร้าน</span></p>
            <p className="text-[11px] text-slate-400 mt-1">
              {pendingShopsCount > 0 ? (
                <span className="text-amber-400 font-bold">⚠️ มีรออนุมัติอีก {pendingShopsCount} ร้าน</span>
              ) : (
                'ร้านค้าทำงานได้ปกติ 100%'
              )}
            </p>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">คิวรออนุมัติ</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{pendingShopsCount} <span className="text-xs font-normal text-slate-400">ร้าน</span></p>
            <p className="text-[11px] text-amber-300 mt-1">รอ CEO กดอนุมัติเปิดใช้งาน</p>
          </div>

          {/* Central LINE Gateway Card */}
          <div className="bg-slate-900 border border-[#06C755]/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-[#06C755] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Central LINE Traffic</span>
              <MessageCircle className="w-5 h-5 text-[#06C755]" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{totalCentralLineMessages.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ 35,000</span></p>
            <p className="text-[11px] text-emerald-400 mt-1">ต้นทุนคงที่ 1,605 บาท/เดือน (ยิงสลัก 0.04฿)</p>
          </div>
        </div>

        {/* TENANT SHOPS MANAGEMENT TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header and Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                รายชื่อร้านค้าในระบบทั้งหมด (Tenant Shop Management)
              </h2>
              <p className="text-xs text-slate-400">อนุมัติร้านค้า ปรับเปลี่ยนสิทธิ์ ขยายเวลา Trial และคุมสถานะการใช้งาน</p>
            </div>

            {/* STATUS FILTER TABS */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusTab('active')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${statusTab === 'active' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ร้านค้าใช้งานอยู่ ({activeShopsCount})
              </button>
              <button
                onClick={() => setStatusTab('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${statusTab === 'pending' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                รออนุมัติ ({pendingShopsCount})
                {pendingShopsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
              </button>
              <button
                onClick={() => setStatusTab('cancelled')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${statusTab === 'cancelled' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                ยกเลิก/ระงับบริการ ({cancelledShopsCount})
              </button>
              <button
                onClick={() => setStatusTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${statusTab === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                ทั้งหมด ({totalShopsCount})
              </button>
            </div>
          </div>

          {/* Search & Plan Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหานามร้าน / เจ้าของ / slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-64"
              />
            </div>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">ทุกแพ็กเกจ</option>
              <option value="free_trial">Free Trial (14 วัน)</option>
              <option value="basic_490">Basic (490 บ./เดือน)</option>
              <option value="pro_990">Pro (990 บ./เดือน)</option>
            </select>
          </div>

          {/* Shops Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">ร้านค้า / เจ้าของร้าน</th>
                  <th className="py-3 px-4 whitespace-nowrap">แพ็กเกจปัจจุบัน</th>
                  <th className="py-3 px-4 whitespace-nowrap">วันหมดอายุ / ตัดรอบบิล</th>
                  <th className="py-3 px-4 whitespace-nowrap">โควตาคิวจองในเดือนนี้</th>
                  <th className="py-3 px-4 whitespace-nowrap">ช่องทางส่ง LINE</th>
                  <th className="py-3 px-4 whitespace-nowrap">สถานะบัญชี</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">การจัดการสิทธิ์ (Manual Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      ไม่พบข้อมูลร้านค้าตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => {
                    const usagePercent = Math.min(100, Math.round((shop.bookingsThisMonth / (shop.maxBookingsQuota + shop.topupBookings)) * 100));
                    const isNearLimit = usagePercent >= 80;

                    return (
                      <tr key={shop.id} className="hover:bg-slate-800/40 transition-all">
                        {/* Shop details */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{shop.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-emerald-400">/book/{shop.slug}</span>
                            <a
                              href={`/dashboard`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
                              title="แอบดูหลังบ้านร้านนี้ในฐานะ Admin"
                            >
                              <Eye className="w-3 h-3" /> ดูหลังบ้าน
                            </a>
                          </div>
                          <p className="text-[10px] text-slate-400">{shop.ownerName} ({shop.ownerPhone})</p>
                        </td>

                        {/* Plan status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {shop.plan === 'free_trial' && (
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block">
                              🎁 Free Trial
                            </span>
                          )}
                          {shop.plan === 'basic_490' && (
                            <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block">
                              ⚡ Basic Starter (490/ด.)
                            </span>
                          )}
                          {shop.plan === 'pro_990' && (
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-block">
                              🚀 Pro Plan (990/ด.)
                            </span>
                          )}
                        </td>

                        {/* Expiration & Renewal Date Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              📅 {shop.nextBillingDate}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {shop.plan === 'free_trial' ? '🗓️ สิ้นสุด Trial 14 วัน' : '🔄 วันตัดรอบบิลถัดไป'}
                            </p>
                          </div>
                        </td>

                        {/* Quota Usage */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1 w-24">
                            <div className="flex justify-between text-[11px] items-center gap-1">
                              <span className={`font-mono font-bold ${isNearLimit ? 'text-rose-400' : 'text-slate-200'}`}>
                                {shop.bookingsThisMonth} / {shop.maxBookingsQuota + shop.topupBookings}
                              </span>
                              {shop.topupBookings > 0 && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                                  +{shop.topupBookings}
                                </span>
                              )}
                            </div>
                            <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                              <div 
                                className={`h-full transition-all ${isNearLimit ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* LINE Channel Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {shop.lineChannelType === 'central' ? (
                            <span className="bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/30 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap inline-block">
                              LINE กลาง ({shop.lineMessagesThisMonth} ข้อความ)
                            </span>
                          ) : (
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap inline-block">
                              LINE ร้านค้า ({shop.lineMessagesThisMonth} ข้อความ)
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {shop.status === 'active' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ปกติ (Active)
                            </span>
                          )}
                          {shop.status === 'pending_approval' && (
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-400" /> รออนุมัติ
                            </span>
                          )}
                          {shop.status === 'cancelled' && (
                            <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-500" /> ยกเลิกบริการ
                            </span>
                          )}
                        </td>

                        {/* Manual Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                            {shop.status === 'pending_approval' ? (
                              <>
                                <button
                                  onClick={() => handleApproveShop(shop.id)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px] shadow-sm transition-all flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> อนุมัติ
                                </button>
                                <button
                                  onClick={() => handleRejectShop(shop.id)}
                                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                                >
                                  ปฏิเสธ
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleExtendDays(shop.id, 14)}
                                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                                  title="ขยายเวลาแพ็กเกจเพิ่ม 14 วัน"
                                >
                                  +14 วัน
                                </button>
                                <button
                                  onClick={() => handleAddTopupBookings(shop.id, 100)}
                                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                                  title="เติมโควตาเสริม +100 คิว (199 บาท)"
                                >
                                  +100 คิว Topup
                                </button>
                                <select
                                  value={shop.plan}
                                  onChange={(e) => handleUpdatePlan(shop.id, e.target.value as any)}
                                  className="bg-slate-950 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-bold focus:outline-none cursor-pointer"
                                >
                                  <option value="free_trial">Trial</option>
                                  <option value="basic_490">Basic 490</option>
                                  <option value="pro_990">Pro 990</option>
                                </select>
                                <button
                                  onClick={() => handleToggleShopStatus(shop.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all shadow-sm ${
                                    shop.status === 'active'
                                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                  }`}
                                  title={shop.status === 'active' ? 'ระงับบริการร้านค้า' : 'เปิดคืนบริการร้านค้า'}
                                >
                                  {shop.status === 'active' ? 'ระงับบริการ' : 'เปิดคืนบริการ'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
