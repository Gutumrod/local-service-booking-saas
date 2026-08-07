'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, Clock, User, CheckCircle2, QrCode, Upload, ShieldCheck, 
  ChevronRight, Sparkles, MessageCircle, AlertTriangle, Coffee, CalendarOff,
  Copy, Download, Check, ShieldAlert, Send, PhoneCall, Phone, RefreshCw, Loader2
} from 'lucide-react';
import {
  getShopBySlug, getShopServices, getShopStaff, getShopAvailability, createBookingHold,
  submitDepositSlip, uploadDepositSlip, Shop, Service, Staff, HoldResponse,
  StaffSchedule, ShopHoliday,
} from '../../../lib/booking-service';

const CENTRAL_LINE_OA_ID = process.env.NEXT_PUBLIC_CENTRAL_LINE_OA_ID || 'central_booking_oa';

const ALL_TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];

export default function BookingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'good-cuts-barber';

  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [shopHolidays, setShopHolidays] = useState<ShopHoliday[]>([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('11:00');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [copiedPromptpay, setCopiedPromptpay] = useState(false);
  const [savedQrNotice, setSavedQrNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [holdResult, setHoldResult] = useState<HoldResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 15-Minute Countdown Timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  // Fetch shop, services, staff from Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoadingShop(true);
      const shopData = await getShopBySlug(slug);
      if (shopData) {
        setShop(shopData);
        const [servicesData, staffData, availabilityData] = await Promise.all([
          getShopServices(shopData.id),
          getShopStaff(shopData.id),
          getShopAvailability(shopData.id),
        ]);
        setServices(servicesData);
        setStaffList(staffData);
        setStaffSchedules(availabilityData.schedules);
        setShopHolidays(availabilityData.holidays);
        if (servicesData.length > 0) setSelectedService(servicesData[0]);
      }
      setIsLoadingShop(false);
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    return () => {
      if (slipPreview) URL.revokeObjectURL(slipPreview);
    };
  }, [slipPreview]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && !bookingSuccess && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, bookingSuccess, timeLeft]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const promptpayNumber = shop?.promptpay_number || '0812345678';
  const promptpayName = shop?.promptpay_name || shop?.name || 'ร้านค้าบริการ';
  const shopPhone = shop?.phone || '081-234-5678';

  const handleCopyPromptpay = () => {
    navigator.clipboard.writeText(promptpayNumber.replace(/-/g, ''));
    setCopiedPromptpay(true);
    setTimeout(() => setCopiedPromptpay(false), 2000);
  };

  const handleSaveQr = () => {
    const depositAmount = selectedService?.deposit_amount ?? shop?.default_deposit_amount ?? 100;
    const qrUrl = `https://promptpay.io/${promptpayNumber.replace(/[^0-9]/g, '')}/${depositAmount}.png`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `PromptPay-QR-Deposit-${depositAmount}THB.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSavedQrNotice(true);
    setTimeout(() => setSavedQrNotice(false), 2000);
  };

  const availableTimeSlots = useMemo(() => {
    const bookingDate = new Date(`${selectedDate}T00:00:00`);
    const dayOfWeek = bookingDate.getDay();
    const serviceDuration = selectedService?.duration_minutes || 0;
    const wholeShopHoliday = shopHolidays.find(
      holiday => holiday.staff_id === null && holiday.holiday_date === selectedDate
    );
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    return ALL_TIME_SLOTS.map(slotTime => {
      if (wholeShopHoliday) {
        return {
          time: slotTime,
          isAvailable: false,
          reason: wholeShopHoliday.reason || 'ร้านหยุด',
        };
      }

      const slotStart = toMinutes(slotTime);
      const slotEnd = slotStart + serviceDuration;
      const candidateStaff = selectedStaff ? [selectedStaff] : staffList;
      const hasAvailableStaff = candidateStaff.some(staff => {
        const isStaffHoliday = shopHolidays.some(
          holiday => holiday.staff_id === staff.id && holiday.holiday_date === selectedDate
        );
        if (isStaffHoliday) return false;

        const schedule = staffSchedules.find(
          item => item.staff_id === staff.id && item.day_of_week === dayOfWeek
        );
        if (!schedule) return true;
        if (!schedule.is_working_day) return false;

        const outsideWorkingHours =
          slotStart < toMinutes(schedule.work_start) || slotEnd > toMinutes(schedule.work_end);
        const overlapsBreak = schedule.break_start && schedule.break_end
          ? slotStart < toMinutes(schedule.break_end) && slotEnd > toMinutes(schedule.break_start)
          : false;
        return !outsideWorkingHours && !overlapsBreak;
      });

      return {
        time: slotTime,
        isAvailable: hasAvailableStaff,
        reason: hasAvailableStaff ? 'ว่าง' : 'ไม่ว่าง',
      };
    });
  }, [selectedDate, selectedService, selectedStaff, shopHolidays, staffList, staffSchedules]);

  const selectedSlotAvailable = availableTimeSlots.some(
    slot => slot.time === selectedTime && slot.isAvailable
  );

  const handleCreateHold = async () => {
    if (!shop || !selectedService || !customerName || !customerPhone) {
      setErrorMessage('กรุณากรอกชื่อและเบอร์โทรศัพท์ของผู้จองให้ครบถ้วน');
      return;
    }
    if (!selectedSlotAvailable) {
      setErrorMessage('เวลาที่เลือกอยู่นอกตารางงานหรือเป็นวันหยุด กรุณาเลือกเวลาใหม่');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await createBookingHold({
        shop_id: shop.id,
        service_id: selectedService.id,
        staff_id: selectedStaff?.id || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        booking_date: selectedDate,
        start_time: selectedTime + ':00',
      });
      setHoldResult(res);
      setTimeLeft(900); // 15 mins
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการล็อกรอบเวลา กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdResult || !slipFile) {
      setErrorMessage('กรุณาแนบไฟล์สลิปก่อนยืนยันการโอนเงิน');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const slipUrl = await uploadDepositSlip(holdResult.booking_id, slipFile);
      await submitDepositSlip(holdResult.booking_id, slipUrl);
      setBookingSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งสลิป');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingShop) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400">กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-sm font-semibold tracking-wide text-white capitalize">{shop?.name || slug.replace(/-/g, ' ')}</h1>
              <p className="text-[10px] text-emerald-400 font-medium">ระบบจองคิวออนไลน์ • ชำระมัดจำปลอดภัย</p>
            </div>
          </div>

          <a
            href={`tel:${shopPhone.replace(/-/g, '')}`}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1 transition-all"
            title="โทรสอบถามร้านค้า"
          >
            <PhoneCall className="w-3 h-3" />
            <span className="hidden sm:inline">โทร: </span>{shopPhone}
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1">
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {bookingSuccess ? (
          /* PENDING REVIEW / SUBMITTED STATE (PRODUCT_RULES_V1 SECTION 1.4) */
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 text-center shadow-xl shadow-amber-950/40 animate-fade-in space-y-5">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">ได้รับสลิปแล้ว รอตรวจสอบสลิป</h2>
              <p className="text-xs text-slate-400">รหัสการจอง: <span className="font-mono text-emerald-400 font-bold">{holdResult?.booking_code || 'BK-7K2M9Q'}</span></p>
            </div>

            {/* Receipt Card for Customer */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 text-left space-y-2 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" /> สถานะคิวจอง
                </span>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-md font-bold">
                  รอตรวจสอบสลิป
                </span>
              </div>

              <div className="text-xs space-y-1.5 pt-1 text-slate-300">
                <p>บริการ: <span className="font-semibold text-white">{selectedService?.name}</span></p>
                <p>พนักงาน: <span className="font-semibold text-white">{selectedStaff?.nickname || 'ไม่ระบุพนักงาน (สุ่มช่าง)'}</span></p>
                <p>เวลานัด: <span className="font-semibold text-emerald-400">{selectedDate} @ {selectedTime} น.</span></p>
                <p>ยอดมัดจำ: <span className="font-semibold text-emerald-400 font-mono">฿{selectedService?.deposit_amount ?? shop?.default_deposit_amount ?? 100}.00 (ส่งสลิปแล้ว)</span></p>
                <p className="text-slate-400 pt-1">เบอร์สายตรงร้านค้า: <a href={`tel:${shopPhone.replace(/-/g, '')}`} className="font-mono font-bold text-amber-400 hover:underline">{shopPhone}</a></p>
              </div>
            </div>

            {/* Central LINE OA Binding Button */}
            <div className="space-y-2">
              <a
                href={`https://line.me/R/oaMessage/@${CENTRAL_LINE_OA_ID}/?%E0%B8%9C%E0%B8%B9%E0%B8%81%E0%B8%84%E0%B8%B4%E0%B8%A7%20${holdResult?.booking_code}-${holdResult?.link_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-emerald-950/50 transition-all text-center"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span>รับแจ้งเตือนผ่านไลน์ เพื่อไม่พลาดคิวของท่าน</span>
                </div>
                <span className="text-[11px] font-normal text-emerald-100 opacity-90">กดผูกบัญชี LINE กลาง (@{CENTRAL_LINE_OA_ID})</span>
              </a>

              <a
                href={`tel:${shopPhone.replace(/-/g, '')}`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                โทรสอบถามทางร้านกรณีฉุกเฉิน ({shopPhone})
              </a>
            </div>
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
                  {services.map((sv) => (
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
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {sv.duration_minutes} นาที</span>
                        <span className="text-amber-400 font-medium">มัดจำ ฿{sv.deposit_amount ?? shop?.default_deposit_amount ?? 100}</span>
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

            {/* STEP 2: SELECT STAFF & TIME & CUSTOMER INFO */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">2. เลือกพนักงาน & นัดหมายวันเวลา</h2>
                  <p className="text-xs text-slate-400">บริการที่เลือก: <span className="text-emerald-400 font-medium">{selectedService?.name}</span></p>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <p className="text-xs font-bold text-white">ข้อมูลผู้จอง (สำหรับยืนยันสล็อต)</p>
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">ชื่อผู้จอง *</label>
                    <input
                      required
                      type="text"
                      placeholder="เช่น คุณสมชาย ใจดี"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">เบอร์โทรศัพท์ *</label>
                    <input
                      required
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Staff Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">เลือกพนักงานให้บริการ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setSelectedStaff(null)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedStaff === null
                          ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <User className={`w-4 h-4 mb-1 ${selectedStaff === null ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <p className="text-xs font-semibold">ไม่ระบุช่าง (ช่างคนไหนก็ได้)</p>
                    </div>
                    {staffList.map((st) => (
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
                        <p className="text-xs font-semibold">{st.nickname || st.name}</p>
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

                {/* Time Slot Display */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">เลือกรอบเวลาที่ว่าง</label>
                  <div className="grid grid-cols-4 gap-2">
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
                        <div className={`text-[9px] font-sans ${slot.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {slot.reason}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 py-3.5 rounded-xl text-xs font-semibold"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    disabled={isSubmitting || !customerName || !customerPhone || !selectedTime || !selectedSlotAvailable}
                    onClick={handleCreateHold}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        กำลัง ล็อกสล็อตเวลา...
                      </>
                    ) : (
                      <>
                        ถัดไป: ชำระมัดจำ
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROMPTPAY DEPOSIT & SLIP UPLOAD */}
            {step === 3 && (
              <form onSubmit={handleCompleteBooking} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">3. ชำระมัดจำ PromptPay & ยืนยัน</h2>
                  <p className="text-xs text-slate-400">สแกน QR Code โอนมัดจำเพื่อล็อกคิวงานอัตโนมัติ</p>
                </div>

                {/* 15-Minute Countdown Timer Banner */}
                {timeLeft > 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                      <span>กรุณาโอนมัดจำภายใน <span className="font-mono text-sm font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">{formatCountdown(timeLeft)}</span> นาที</span>
                    </div>
                    <p className="text-[10px] text-slate-400">รหัสจองคิวชั่วคราว: <span className="font-mono text-emerald-400 font-bold">{holdResult?.booking_code}</span></p>
                  </div>
                ) : (
                  <div className="bg-rose-500/20 border-2 border-rose-500/40 rounded-xl p-4 text-center space-y-2 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-rose-300 font-extrabold text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>⏰ สล็อตเวลาที่คุณเลือกล็อกไว้หมดอายุแล้ว</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all mt-1 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      เลือกรอบเวลาใหม่
                    </button>
                  </div>
                )}

                {/* PromptPay Card */}
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-center relative overflow-hidden space-y-3">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    PromptPay QR
                  </div>
                  
                  <div className="pt-2">
                    <div className="w-44 h-44 bg-white rounded-2xl p-2 mx-auto mb-2 flex items-center justify-center border border-slate-300 shadow-xl">
                      <img 
                        src={`https://promptpay.io/${promptpayNumber.replace(/[^0-9]/g, '')}/${selectedService?.deposit_amount ?? shop?.default_deposit_amount ?? 100}.png`} 
                        alt="PromptPay QR Code"
                        className="w-40 h-40 object-contain rounded-xl"
                      />
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
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono my-0.5">฿{selectedService?.deposit_amount ?? shop?.default_deposit_amount ?? 100}.00</p>
                    <p className="text-[11px] text-slate-400">ชื่อบัญชี: <span className="text-white font-medium">{promptpayName}</span></p>
                    
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
                    disabled={isSubmitting || timeLeft === 0 || !slipFile}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                  >
                    {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการโอนเงินมัดจำ'}
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
