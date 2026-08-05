import Link from 'next/link';
import { CalendarCheck, ShieldCheck, QrCode, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl shadow-emerald-950/50">
          <CalendarCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
            Customer Booking Portal
          </span>
          <h1 className="text-2xl font-bold text-white mt-3">ระบบจองคิวบริการ & ชำระมัดจำ QR</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            จองคิวระบุช่าง โอนมัดจำ PromptPay QR เพื่อล็อกคิวงานอัตโนมัติ พร้อมรับการแจ้งเตือนผ่าน LINE
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>เลือกรอบเวลาและช่างผู้ให้บริการได้ทันที</span>
          </div>
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>สร้าง PromptPay QR มัดจำอัตโนมัติตามยอดบริการ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>ตรวจสอบสลิปและยืนยันคิวผ่าน LINE OA ร้านค้า</span>
          </div>
        </div>

        <Link
          href="/book/good-cuts-barber"
          className="block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all"
        >
          ทดลองจองคิวร้าน Demo (Good Cuts Barber)
        </Link>
      </div>
    </div>
  );
}
