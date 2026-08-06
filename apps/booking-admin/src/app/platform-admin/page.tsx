'use client';

import React, { useState } from 'react';
import { 
  Store, Users, CreditCard, MessageCircle, AlertTriangle, ShieldCheck, 
  Sparkles, DollarSign, Activity, CheckCircle2, XCircle, Search, 
  Plus, Edit3, Lock, Server, BarChart3, RefreshCw, Layers, ArrowUpRight
} from 'lucide-react';

interface TenantShop {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerPhone: string;
  plan: 'free_trial' | 'basic_490' | 'pro_990';
  status: 'active' | 'past_due' | 'cancelled' | 'suspended';
  trialEndsAt: string;
  nextBillingDate: string;
  bookingsThisMonth: number;
  maxBookingsQuota: number;
  topupBookings: number;
  lineMessagesThisMonth: number;
  lineChannelType: 'central' | 'custom';
}

const INITIAL_TENANT_SHOPS: TenantShop[] = [
  {
    id: 'shp_1',
    name: 'Good Cuts Barber',
    slug: 'good-cuts-barber',
    ownerName: 'คุณสมชาย ใจดี',
    ownerPhone: '081-234-5678',
    plan: 'free_trial',
    status: 'active',
    trialEndsAt: '2026-08-19',
    nextBillingDate: '2026-08-19',
    bookingsThisMonth: 12,
    maxBookingsQuota: 50,
    topupBookings: 0,
    lineMessagesThisMonth: 36,
    lineChannelType: 'central'
  },
  {
    id: 'shp_2',
    name: 'Glamour Hair Studio',
    slug: 'glamour-hair-studio',
    ownerName: 'คุณศิริพร บุญมา',
    ownerPhone: '082-999-8877',
    plan: 'pro_990',
    status: 'active',
    trialEndsAt: '2026-05-10',
    nextBillingDate: '2026-09-10',
    bookingsThisMonth: 340,
    maxBookingsQuota: 500,
    topupBookings: 100,
    lineMessagesThisMonth: 1020,
    lineChannelType: 'custom'
  },
  {
    id: 'shp_3',
    name: 'Vintage Barber & Spa',
    slug: 'vintage-barber-spa',
    ownerName: 'คุณธีรพงษ์ วงศ์สว่าง',
    ownerPhone: '085-111-2233',
    plan: 'basic_490',
    status: 'active',
    trialEndsAt: '2026-06-01',
    nextBillingDate: '2026-09-01',
    bookingsThisMonth: 92,
    maxBookingsQuota: 100,
    topupBookings: 0,
    lineMessagesThisMonth: 276,
    lineChannelType: 'central'
  },
  {
    id: 'shp_4',
    name: 'Clean Detailing Garage',
    slug: 'clean-detailing-garage',
    ownerName: 'คุณอัครเดช รุ่งเรือง',
    ownerPhone: '089-444-5566',
    plan: 'free_trial',
    status: 'cancelled',
    trialEndsAt: '2026-07-20',
    nextBillingDate: '2026-07-20',
    bookingsThisMonth: 48,
    maxBookingsQuota: 50,
    topupBookings: 0,
    lineMessagesThisMonth: 144,
    lineChannelType: 'central'
  }
];

export default function PlatformSuperAdminPage() {
  const [shops, setShops] = useState<TenantShop[]>(INITIAL_TENANT_SHOPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free_trial' | 'basic_490' | 'pro_990'>('all');
  const [selectedShop, setSelectedShop] = useState<TenantShop | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Platform Metrics
  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.status === 'active').length;
  const proSubscribers = shops.filter(s => s.plan === 'pro_990').length;
  const basicSubscribers = shops.filter(s => s.plan === 'basic_490').length;
  const trialShops = shops.filter(s => s.plan === 'free_trial').length;
  
  // Monthly Revenue Estimate (THB)
  const mrr = (proSubscribers * 990) + (basicSubscribers * 490);
  
  // Central LINE OA Usage
  const totalCentralLineMessages = shops
    .filter(s => s.lineChannelType === 'central')
    .reduce((sum, s) => sum + s.lineMessagesThisMonth, 0);
  const centralLineQuota = 35000;
  const centralLineCostFixed = 1605; // 1,605 THB/mo including VAT

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
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
        triggerNotice(nextStatus === 'cancelled' ? `ยกเลิก/ระงับบริการร้าน ${s.name} เรียบร้อยแล้ว` : `เปิดคืนบริการร้าน ${s.name} เรียบร้อยแล้ว`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const filteredShops = shops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || s.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

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
              <p className="text-[11px] text-slate-400">ระบบหลังบ้านผู้ให้บริการ • บริหารจัดการร้านค้า สิทธิแพ็กเกจ และ Central LINE OA Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {notice && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-semibold animate-fade-in">
                ✓ {notice}
              </span>
            )}
            <a
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl font-medium border border-slate-700 transition-all"
            >
              สลับไปหน้า Dashboard ร้านค้า
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
        {/* KPI Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* MRR Card */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">ประมาณการรายได้ประจำเดือน (MRR)</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">฿{mrr.toLocaleString()}.00</p>
            <p className="text-[11px] text-emerald-400 mt-1">จาก Basic ({basicSubscribers}) + Pro ({proSubscribers}) ร้านค้า</p>
          </div>

          {/* Tenant Shops Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">ร้านค้าทั้งหมดในระบบ</span>
              <Store className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{totalShops} ร้าน</p>
            <p className="text-[11px] text-slate-400 mt-1">ใช้งานจริง: <span className="text-emerald-400 font-bold">{activeShops}</span> • Trial: <span className="text-amber-400 font-bold">{trialShops}</span></p>
          </div>

          {/* Central LINE OA Traffic Monitor */}
          <div className="bg-slate-900 border border-[#06C755]/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between text-[#06C755] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Central LINE OA Traffic</span>
              <MessageCircle className="w-5 h-5 text-[#06C755]" />
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{totalCentralLineMessages.toLocaleString()} / {centralLineQuota.toLocaleString()}</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-[#06C755] h-full transition-all"
                style={{ width: `${Math.min(100, (totalCentralLineMessages / centralLineQuota) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">ต้นทุนคงที่ LINE Pro: <span className="text-amber-400 font-bold">฿1,605/เดือน</span></p>
          </div>

          {/* System Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">สถานะระบบหลัก (System Status)</span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              Supabase Live Healthy
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Postgres Range Exclusion: <span className="text-emerald-400 font-semibold">Active</span></p>
          </div>
        </div>

        {/* Tenant Shops Control Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-400" />
                รายชื่อร้านค้าในระบบ & การจัดการโควตาแพ็กเกจ (Tenant Management)
              </h2>
              <p className="text-xs text-slate-400">ค้นหาร้านค้า ปรับเปลี่ยนสิทธิแพ็กเกจ ต่ออายุ Trial และเพิ่มโควตาคิวจองแบบ Manual</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหานามร้าน / เจ้าของ / slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-60"
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
                {filteredShops.map((shop) => {
                  const usagePercent = Math.min(100, Math.round((shop.bookingsThisMonth / (shop.maxBookingsQuota + shop.topupBookings)) * 100));
                  const isNearLimit = usagePercent >= 80;

                  return (
                    <tr key={shop.id} className="hover:bg-slate-800/40 transition-all">
                      {/* Shop details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">{shop.name}</p>
                        <p className="font-mono text-[11px] text-emerald-400">/book/{shop.slug}</p>
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
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className={`font-mono font-bold ${isNearLimit ? 'text-rose-400' : 'text-slate-200'}`}>
                              {shop.bookingsThisMonth} / {shop.maxBookingsQuota + shop.topupBookings} คิว
                            </span>
                            {shop.topupBookings > 0 && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                                Topup +{shop.topupBookings}
                              </span>
                            )}
                          </div>
                          <div className="w-36 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
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
                      <td className="py-3.5 px-4">
                        {shop.status === 'active' && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ปกติ (Active)
                          </span>
                        )}
                        {shop.status === 'cancelled' && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> ยกเลิกบริการ
                          </span>
                        )}
                      </td>

                      {/* Manual Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-2 text-right">
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
                            title={shop.status === 'active' ? 'ยกเลิก/ระงับบริการร้านค้า' : 'เปิดคืนบริการร้านค้า'}
                          >
                            {shop.status === 'active' ? 'ยกเลิกบริการ' : 'เปิดคืนบริการ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
