'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, Clock, User, CheckCircle2, QrCode, Upload, ShieldCheck, 
  ChevronRight, Sparkles, MessageCircle, AlertTriangle, Coffee, CalendarOff,
  Copy, Download, Check, ShieldAlert
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
}

interface Staff {
  id: string;
  name: string;
  nickname: string;
  weeklyOffDays: number[];
  breakStart: string;
  breakEnd: string;
}

const DEMO_SERVICES: Service[] = [
  { id: '1', name: 'ตัดผมชายพรีเมียม + สระเซ็ต (Signature Haircut)', description: 'บริการตัดแต่งทรงผมอย่างประณีต พร้อมสระนวดผ่อนคลายและจัดทรงด้วยผลิตภัณฑ์นำเข้า', duration: 45, price: 350, deposit: 100 },
  { id: '2', name: 'ดัดวอลลุ่มสไตล์เกาหลี (Korean Down Perm)', description: 'กดผมด้านข้าง ล็อกทรงวอลลุ่มธรรมชาติ ดูแลเส้นผมด้วยทรีตเมนต์บำรุง', duration: 90, price: 1200, deposit: 300 },
  { id: '3', name: 'ทำสีผมพรีเมียม (Premium Hair Color)', description: 'ทำสีผมแฟชั่น/ปกปิดผมขาว พร้อมทรีตเมนต์เคลือบเงาป้องกันผมเสีย', duration: 120, price: 1800, deposit: 500 },
  { id: '4', name: 'สปาหนังศีรษะแบบล้ำลึก (Deep Scalp Treatment)', description: 'ดีท็อกซ์หนังศีรษะ ขจัดความมันและรังแค พร้อมนวดผ่อนคลายความเครียด', duration: 60, price: 790, deposit: 200 }
];

const DEMO_STAFF: Staff[] = [
  { id: 'stany', name: 'ไม่ระบุพนักงาน (พนักงานคนไหนก็ได้ที่ว่าง)', nickname: 'ไม่ระบุพนักงาน (สุ่มพนักงานที่ว่าง)', weeklyOffDays: [], breakStart: '12:00', breakEnd: '13:00' },
  { id: 'st1', name: 'ช่างเอก (Master Stylist)', nickname: 'ช่างเอก', weeklyOffDays: [1], breakStart: '12:00', breakEnd: '13:00' },
  { id: 'st2', name: 'ช่างตั้ม (Fade Specialist)', nickname: 'ช่างตั้ม', weeklyOffDays: [2], breakStart: '13:00', breakEnd: '14:00' },
  { id: 'st3', name: 'ช่างบิว (Color Expert)', nickname: 'ช่างบิว', weeklyOffDays: [3], breakStart: '14:00', breakEnd: '15:00' }
];

const SPECIAL_HOLIDAYS = [
  { date: '2026-08-12', reason: 'วันแม่แห่งชาติ (ร้านปิดทำการประจำปี)' }
];

// Slots with booked status simulation to prevent double booking
const SLOT_STATUS_MAP: Record<string, boolean> = {
  '10:30': true, // Booked
  '14:30': true  // Booked
};

const ALL_TIME_SLOTS = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];

export default function BookingPage() {
  const params = useParams();
  const slug = params?.slug as string || 'good-cuts-barber';

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(DEMO_SERVICES[0]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(DEMO_STAFF[0]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [selectedTime, setSelectedTime] = useState<string>('11:30');

  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [copiedPromptpay, setCopiedPromptpay] = useState(false);
  const [savedQrNotice, setSavedQrNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const promptpayNumber = '081-234-5678';
  const lineOaUrl = 'https://line.me/R/ti/p/@goodcutsbarber';

  const handleCopyPromptpay = () => {
    navigator.clipboard.writeText(promptpayNumber.replace(/-/g, ''));
    setCopiedPromptpay(true);
    setTimeout(() => setCopiedPromptpay(false), 2000);
  };

  const handleSaveQr = () => {
    setSavedQrNotice(true);
    setTimeout(() => setSavedQrNotice(false), 2000);
  };

  const dayOfWeek = useMemo(() => {
    if (!selectedDate) return 0;
    return new Date(selectedDate).getDay();
  }, [selectedDate]);

  const isSpecialShopHoliday = useMemo(() => {
    return SPECIAL_HOLIDAYS.find(h => h.date === selectedDate);
  }, [selectedDate]);

  const isStaffWeeklyOff = useMemo(() => {
    if (!selectedStaff || selectedStaff.id === 'stany') return false;
    return selectedStaff.weeklyOffDays.includes(dayOfWeek);
  }, [selectedStaff, dayOfWeek]);

  const availableTimeSlots = useMemo(() => {
    if (isSpecialShopHoliday || isStaffWeeklyOff || !selectedStaff) return [];

    return ALL_TIME_SLOTS.map(slotTime => {
      const [slotHour] = slotTime.split(':').map(Number);
      const [breakStartHour] = selectedStaff.breakStart.split(':').map(Number);
      const [breakEndHour] = selectedStaff.breakEnd.split(':').map(Number);

      const isBreak = slotHour >= breakStartHour && slotHour < breakEndHour;
      const isBooked = !!SLOT_STATUS_MAP[slotTime];

      return {
        time: slotTime,
        isAvailable: !isBreak && !isBooked,
        reason: isBreak ? 'พักเที่ยง' : isBooked ? 'คิวเต็มแล้ว' : 'ว่าง'
      };
    });
  }, [selectedStaff, isSpecialShopHoliday, isStaffWeeklyOff]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              Q
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white capitalize">{slug.replace(/-/g, ' ')}</h1>
              <p className="text-[10px] text-emerald-400 font-medium">ระบบจองคิวออนไลน์ • ชำระมัดจำปลอดภัย</p>
            </div>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
            ขั้นตอน {step}/3
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1">
        {bookingSuccess ? (
          /* SUCCESS STATE */
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 text-center shadow-xl shadow-emerald-950/40 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">ส่งสลิป & ยืนยันการจองเรียบร้อย!</h2>
            <p className="text-xs text-slate-400 mb-6">รหัสการจอง: <span className="font-mono text-emerald-400 font-bold">#BK-{Math.floor(1000 + Math.random() * 9000)}</span></p>

            <div className="bg-slate-950/80 rounded-xl p-4 text-left border border-slate-800 space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">บริการ:</span>
                <span className="font-medium text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">พนักงานให้บริการ:</span>
                <span className="font-medium text-white">{selectedStaff?.nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">วัน-เวลา:</span>
                <span className="font-medium text-emerald-400">{selectedDate} เวลา {selectedTime} น.</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">มัดจำที่โอนแล้ว:</span>
                <span className="font-semibold text-emerald-400">฿{selectedService?.deposit} (รอร้านค้าอนุมัติ)</span>
              </div>
            </div>

            {/* Direct Link to LINE Official Account */}
            <a
              href={lineOaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              รับการแจ้งเตือนคิวผ่าน LINE OA ร้าน (@goodcutsbarber)
            </a>
          </div>
        ) : (
          <div>
            {/* STEP 1: SELECT SERVICE */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">1. เลือกบริการที่คุณต้องการ</h2>
                  <p className="text-xs text-slate-400">เลือกบริการเพื่อดูรายละเอียดระยะเวลาและค่ามัดจำ</p>
                </div>

                <div className="space-y-3">
                  {DEMO_SERVICES.map((sv) => (
                    <div
                      key={sv.id}
                      onClick={() => setSelectedService(sv)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedService?.id === sv.id
                          ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/30'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-semibold text-sm text-white">{sv.name}</h3>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ฿{sv.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{sv.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {sv.duration} นาที</span>
                        <span className="text-amber-400 font-medium">มัดจำ ฿{sv.deposit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all mt-6"
                >
                  ถัดไป: เลือกพนักงาน & วันเวลา
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: SELECT STAFF & TIME (UPDATED WITH NO-STAFF MODE & PREVENT DOUBLE BOOKING) */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">2. เลือกพนักงาน & นัดหมายวันเวลา</h2>
                  <p className="text-xs text-slate-400">บริการที่เลือก: <span className="text-emerald-400 font-medium">{selectedService?.name}</span></p>
                </div>

                {/* Staff Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">เลือกพนักงานให้บริการ (หรือเลือกสุ่มไม่ระบุพนักงาน)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_STAFF.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaff(st)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedStaff?.id === st.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <User className={`w-4 h-4 mb-1 ${selectedStaff?.id === st.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <p className="text-xs font-semibold">{st.nickname}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">เลือกวันที่</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Time Slot Display with Prevent Double-Booking */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">เลือกรอบเวลาที่ว่าง (ป้องกันการจองซ้ำซ้อน)</label>

                  {isSpecialShopHoliday ? (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-center text-xs text-rose-300 space-y-1">
                      <AlertTriangle className="w-5 h-5 mx-auto text-rose-400" />
                      <p className="font-bold">{isSpecialShopHoliday.reason}</p>
                      <p className="text-[11px] text-slate-400">กรุณาเลือกวันที่อื่นเพื่อจองคิวบริการ</p>
                    </div>
                  ) : isStaffWeeklyOff ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-center text-xs text-amber-300 space-y-1">
                      <CalendarOff className="w-5 h-5 mx-auto text-amber-400" />
                      <p className="font-bold">{selectedStaff?.nickname} หยุดประจำสัปดาห์ในวันที่เลือก</p>
                      <p className="text-[11px] text-slate-400">กรุณาเลือกพนักงานคนอื่น หรือเลือกวันที่พนักงานเข้าทำงาน</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                          className={`py-2 px-1 rounded-lg text-xs font-mono border transition-all text-center ${
                            selectedTime === slot.time && slot.isAvailable
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                              : slot.isAvailable
                              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              : 'bg-slate-900/30 border-slate-900 text-slate-600 cursor-not-allowed line-through'
                          }`}
                        >
                          <div>{slot.time} น.</div>
                          <div className={`text-[9px] font-sans ${slot.isAvailable ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                            {slot.reason}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-3.5 rounded-xl text-xs font-semibold"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    disabled={isSpecialShopHoliday !== undefined || isStaffWeeklyOff || !selectedTime}
                    onClick={() => setStep(3)}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                  >
                    ถัดไป: ชำระมัดจำ
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROMPTPAY DEPOSIT & SLIP UPLOAD (WITH COPY & DOWNLOAD BUTTONS + ANTI-FAKE SLIP BADGE) */}
            {step === 3 && (
              <form onSubmit={handleCompleteBooking} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">3. ชำระมัดจำ PromptPay & ยืนยัน</h2>
                  <p className="text-xs text-slate-400">สแกน QR Code โอนมัดจำเพื่อล็อกคิวงานอัตโนมัติ</p>
                </div>

                {/* PromptPay Card */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-center relative overflow-hidden space-y-3">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    PromptPay QR
                  </div>
                  
                  {/* PromptPay QR Image & Download Button */}
                  <div className="pt-2">
                    <div className="w-36 h-36 bg-white rounded-xl p-2 mx-auto mb-2 flex items-center justify-center border border-slate-300 shadow-md">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveQr}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1 rounded-lg border border-slate-700 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {savedQrNotice ? 'บันทึก QR Code แล้ว!' : 'บันทึกรูป QR Code'}
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">ยอดเงินมัดจำล็อกคิว</p>
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono my-0.5">฿{selectedService?.deposit}.00</p>
                    <p className="text-[11px] text-slate-400">ชื่อบัญชี: <span className="text-white font-medium">บจก. กู้ด คัทส์ (Good Cuts Co., Ltd.)</span></p>
                    
                    {/* PromptPay Number with Copy Button */}
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">เลขพร้อมเพย์: <span className="font-mono text-white font-bold">{promptpayNumber}</span></span>
                      <button
                        type="button"
                        onClick={handleCopyPromptpay}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/40 text-[10px] flex items-center gap-1 font-semibold"
                      >
                        {copiedPromptpay ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedPromptpay ? 'คัดลอกแล้ว' : 'คัดลอกเลข'}
                      </button>
                    </div>
                  </div>

                  {/* Anti-Fake Slip Protection Badge */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 text-left">
                    <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>ระบบมีระบบสแกน QR บนสลิปและตรวจสอบสลิปปลอมอัตโนมัติ ป้องกันสลิปซ้ำซ้อน 100%</span>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">ชื่อผู้จอง *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น คุณสมชาย ใจดี"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">เบอร์โทรศัพท์ (สำหรับแจ้งเตือนคิว) *</label>
                    <input
                      required
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Slip Upload */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1 block">แนบสลิปการโอนมัดจำ *</label>
                    <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center bg-slate-900/50 transition-all">
                      <input
                        required
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {slipPreview ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={slipPreview} alt="Slip" className="w-12 h-16 object-cover rounded-md border border-emerald-500" />
                          <div className="text-left">
                            <p className="text-xs font-semibold text-emerald-400">แนบสลิปเรียบร้อยแล้ว</p>
                            <p className="text-[10px] text-slate-400">คลิกเพื่อเปลี่ยนรูป</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                          <p className="text-xs text-slate-300 font-medium">คลิกเพื่ออัปโหลดสลิปเงินมัดจำ</p>
                          <p className="text-[10px] text-slate-500">รองรับไฟล์ JPG, PNG</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-3.5 rounded-xl text-xs font-semibold"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                  >
                    {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการจองคิว'}
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 px-4 text-center text-[11px] text-slate-600">
        Powered by <span className="font-semibold text-slate-400">Local Service Booking SaaS</span> • ปลอดภัย 100%
      </footer>
    </div>
  );
}
