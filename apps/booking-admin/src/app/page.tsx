import Link from 'next/link';
import { CalendarCheck, ShieldCheck, QrCode, Sparkles, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl shadow-emerald-950/50">
          <LayoutDashboard className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-semibold">
            Store Owner Admin Portal
          </span>
          <h1 className="text-2xl font-bold text-white mt-3">ระบบหลังบ้าน Local Service SaaS</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            จัดการคิวงาน ตรวจสลิปมัดจำ PromptPay และส่งแจ้งเตือน LINE OA อัตโนมัติในที่เดียว
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>ทดลองใช้งานฟรี 14 วัน (Self-service Setup)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>ตรวจสลิปมัดจำ PromptPay ล็อกคิวงาน ป้องกัน No-show</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>สมัครสมาชิกรายเดือนอัตโนมัติ (490 - 990 บาท/เดือน)</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/register"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            สมัครสมาชิกร้านค้าใหม่ (ทดลองใช้ฟรี 14 วัน)
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            เข้าสู่ระบบหลังบ้านร้านค้า
          </Link>
        </div>
      </div>
    </div>
  );
}
