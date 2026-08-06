'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, User, Phone, Mail, Lock, Sparkles, Check, ArrowRight, ArrowLeft, 
  QrCode, CreditCard, ShieldCheck, HelpCircle, Building, CheckCircle2, Globe
} from 'lucide-react';

const SUGGESTED_CATEGORIES = [
  '💈 ร้านตัดผม / บาร์เบอร์',
  '🚗 คาร์แคร์ / ล้างรถ / เคลือบแก้ว',
  '💅 ร้านทำเล็บ / ต่อขนตา / สปามือเท้า',
  '🏥 คลินิกเสริมความงาม / ทันตกรรม',
  '🧘 สปา / นวดแผนไทย / ดีท็อกซ์',
  '📸 สตูดิโอถ่ายภาพ / สตูดิโอซ้อมดนตรี',
  '🏸 สนามแบดมินตัน / สนามฟุตซอล',
  '🐾 อาบน้ำตัดขนสัตว์เลี้ยง (Pet Grooming)'
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Shop & Owner Info
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'free_trial' | 'basic_490' | 'pro_990'>('free_trial');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Step 3: PromptPay Setup
  const [promptpayNumber, setPromptpayNumber] = useState('');
  const [promptpayName, setPromptpayName] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto generate slug from shop name
  const handleShopNameChange = (val: string) => {
    setShopName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setShopSlug(generatedSlug || 'my-shop');
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full space-y-6">
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold hover:bg-emerald-500/20 transition-all">
            <Store className="w-4 h-4" />
            Local Service Booking SaaS
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">สมัครสมาชิกร้านค้า & เปิดระบบจองคิว</h1>
          <p className="text-xs text-slate-400">เริ่มต้นรับจองคิวออนไลน์ ล็อกคิวด้วยมัดจำ PromptPay QR และยิงแจ้งเตือน LINE ให้อัตโนมัติ</p>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 font-semibold ${currentStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${currentStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</span>
            <span className="hidden sm:inline">ข้อมูลร้านค้า</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-3" />
          <div className={`flex items-center gap-2 font-semibold ${currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${currentStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span className="hidden sm:inline">เลือกแพ็กเกจ</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-3" />
          <div className={`flex items-center gap-2 font-semibold ${currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${currentStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span className="hidden sm:inline">ตั้งค่า PromptPay</span>
          </div>
        </div>

        {/* Form Main Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {isSuccess ? (
            <div className="text-center py-10 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-white">ลงทะเบียนสร้างร้านค้าเรียบร้อยแล้ว! 🎉</h2>
              <p className="text-xs text-slate-400">กำลังนำท่านเข้าสู่หน้าแดชบอร์ดหลังบ้านร้านค้า...</p>
            </div>
          ) : (
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* STEP 1: SHOP & OWNER IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Building className="w-5 h-5 text-emerald-400" />
                    ข้อมูลร้านค้าและบัญชีเจ้าของร้าน (Step 1/3)
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">ชื่อร้านค้า (Shop Name) *</label>
                      <input
                        required
                        type="text"
                        placeholder="เช่น Good Cuts Barber / สปาขนตาพรีเมียม"
                        value={shopName}
                        onChange={(e) => handleShopNameChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* URL Slug Preview */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-400" /> ลิงก์หน้าจองออนไลน์ลูกค้า:
                      </span>
                      <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        http://localhost:3000/book/<span className="text-amber-400">{shopSlug || 'your-shop-slug'}</span>
                      </span>
                    </div>

                    {/* FREE-TEXT BUSINESS CATEGORY WITH QUICK SUGGESTION CHIPS */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        ประเภทธุรกิจ / หมวดหมู่บริการ <span className="text-emerald-400 font-normal">(Free-text กรอกได้อิสระ ไม่จำกัดประเภท)</span> *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="เช่น ร้านตัดผม / คาร์แคร์ / คลินิก / สตูดิโอถ่ายรูป / สนามฟุตซอล"
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      
                      {/* Suggestion Chips */}
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[10px] text-slate-400 block font-medium">หรือคลิกเลือกหมวดหมู่อย่างไว:</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {SUGGESTED_CATEGORIES.map((cat, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBusinessCategory(cat.replace(/^[^a-zA-Z0-9\u0E00-\u0E7F]+\s*/, ''))}
                              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/50 px-2.5 py-1 rounded-lg transition-all"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">ชื่อ-นามสกุล เจ้าของร้าน *</label>
                        <input
                          required
                          type="text"
                          placeholder="เช่น คุณสมชาย ใจดี"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">เบอร์โทรศัพท์สายตรง *</label>
                        <input
                          required
                          type="tel"
                          placeholder="08X-XXX-XXXX"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">อีเมลสำหรับล็อกอิน *</label>
                        <input
                          required
                          type="email"
                          placeholder="owner@yourshop.com"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">รหัสผ่าน (Password) *</label>
                        <input
                          required
                          type="password"
                          placeholder="อย่างน้อย 8 ตัวอักษร"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT PLAN */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      เลือกแพ็กเกจระบบรับจองคิว (Step 2/3)
                    </h2>

                    {/* Monthly / Yearly Switch */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`text-[11px] font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>รายเดือน</span>
                      <button
                        type="button"
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-10 h-5 bg-slate-800 rounded-full p-0.5 border border-slate-700 relative"
                      >
                        <div className={`w-3.5 h-3.5 bg-emerald-500 rounded-full transition-all ${billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className={`text-[11px] font-semibold ${billingCycle === 'yearly' ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        รายปี <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30">ประหยัด 2 เดือน</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* FREE TRIAL TIER */}
                    <div
                      onClick={() => setSelectedPlan('free_trial')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all space-y-3 relative ${
                        selectedPlan === 'free_trial'
                          ? 'bg-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-white">🎁 Free Trial</h3>
                        {selectedPlan === 'free_trial' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xl font-extrabold text-emerald-400 font-mono">ฟรี 14 วัน</p>
                      <p className="text-[11px] text-slate-400">เริ่มต้นใช้งานได้ทันที ไม่ต้องกรอกบัตรเครดิต</p>
                      <ul className="text-[10px] space-y-1.5 text-slate-300 border-t border-slate-800/80 pt-2">
                        <li>✓ รับจองสูงสุด 50 คิว</li>
                        <li>✓ เพิ่มพนักงานสูงสุด 5 คน</li>
                        <li>✓ แจ้งเตือนผ่าน LINE กลาง</li>
                      </ul>
                    </div>

                    {/* BASIC TIER */}
                    <div
                      onClick={() => setSelectedPlan('basic_490')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all space-y-3 relative ${
                        selectedPlan === 'basic_490'
                          ? 'bg-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-white">⚡ Basic Starter</h3>
                        {selectedPlan === 'basic_490' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xl font-extrabold text-white font-mono">
                        {billingCycle === 'monthly' ? '฿490' : '฿4,900'} <span className="text-[10px] font-normal text-slate-400">/{billingCycle === 'monthly' ? 'เดือน' : 'ปี'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">สำหรับร้านขนาดเล็ก (1-5 คน)</p>
                      <ul className="text-[10px] space-y-1.5 text-slate-300 border-t border-slate-800/80 pt-2">
                        <li>✓ รับจองสูงสุด 100 คิว/เดือน</li>
                        <li>✓ เพิ่มพนักงานสูงสุด 5 คน</li>
                        <li>✓ แจ้งเตือนผ่าน LINE กลาง</li>
                      </ul>
                    </div>

                    {/* PRO TIER */}
                    <div
                      onClick={() => setSelectedPlan('pro_990')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all space-y-3 relative ${
                        selectedPlan === 'pro_990'
                          ? 'bg-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        แนะนำ
                      </span>
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-white">🚀 Pro</h3>
                        {selectedPlan === 'pro_990' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xl font-extrabold text-emerald-400 font-mono">
                        {billingCycle === 'monthly' ? '฿990' : '฿9,900'} <span className="text-[10px] font-normal text-slate-400">/{billingCycle === 'monthly' ? 'เดือน' : 'ปี'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">สำหรับร้านหลายช่าง / แบรนด์พรีเมียม</p>
                      <ul className="text-[10px] space-y-1.5 text-slate-300 border-t border-slate-800/80 pt-2">
                        <li>✓ รับจองสูงสุด 500 คิว/เดือน</li>
                        <li>✓ เพิ่มพนักงานสูงสุด 10 คน</li>
                        <li>✓ รองรับ Custom LINE Token</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PROMPTPAY SETUP */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    ตั้งค่า PromptPay รับเงินมัดจำ (Step 3/3)
                  </h2>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> เงินมัดจำเข้าบัญชีร้านค้าโดยตรง 100%
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ระบบจะนำเลขพร้อมเพย์นี้ไปสร้างเป็น Dynamic QR Code ให้ลูกค้าสแกนโอนเงินมัดจำ เงินเข้าบัญชีท่านทันทีโดยไม่ผ่านตัวกลาง
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">เลขพร้อมเพย์ร้านค้า (PromptPay Number) *</label>
                      <input
                        required
                        type="text"
                        placeholder="เช่น 080-074-2005 หรือ เลขนิติบุคคล 13 หลัก"
                        value={promptpayNumber}
                        onChange={(e) => setPromptpayNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">ชื่อบัญชีรับโอนเงินมัดจำ *</label>
                      <input
                        required
                        type="text"
                        placeholder="เช่น คุณสมชาย ใจดี (PromptPay Direct)"
                        value={promptpayName}
                        onChange={(e) => setPromptpayName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ย้อนกลับ
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all ml-auto disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'กำลังสร้างร้านค้า...'
                  ) : currentStep === 3 ? (
                    <>
                      ยืนยันสร้างร้านค้า & เข้าสู่แดชบอร์ด
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      ถัดไป
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
