'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createTicket,
  fetchTicketsByPhone,
  getCurrentShopMembership,
} from '@/lib/ticket-service';
import {
  isValidPhone,
  normalizePhone,
  validateDeadline,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_TYPE_LABELS,
  type Attachment,
  type NewTicketInput,
  type Priority,
  type Ticket,
  type TicketType,
} from '@/lib/ticket-domain';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  History,
} from 'lucide-react';

const TICKET_TYPES: TicketType[] = [
  'ProductClaim',
  'ServiceIssue',
  'RecheckRequest',
  'RefundRequest',
  'Other',
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

function toLocalDatetimeString(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function NewTicketIntakePage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // Form Fields
  const [receivedAt, setReceivedAt] = useState(() => toLocalDatetimeString(new Date()));
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toLocalDatetimeString(d);
  });
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>('ServiceIssue');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [issueCategory, setIssueCategory] = useState('');
  const [relatedProductService, setRelatedProductService] = useState('');
  const [description, setDescription] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Attachments Metadata Only
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attName, setAttName] = useState('');
  const [attMime, setAttMime] = useState('image/jpeg');
  const [attSize, setAttSize] = useState('');

  // Duplicate Phone History State (Surfaces past tickets without autofill)
  const [phoneHistoryTickets, setPhoneHistoryTickets] = useState<Ticket[]>([]);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  useEffect(() => {
    async function initShop() {
      try {
        const mem = await getCurrentShopMembership();
        setShopId(mem.shopId);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'ตรวจสอบสิทธิ์ร้านค้าไม่สำเร็จ');
      }
    }
    initShop();
  }, []);

  // When phone changes and is valid, search for duplicate customer tickets
  useEffect(() => {
    if (!shopId || !isValidPhone(customerPhone)) {
      setPhoneHistoryTickets([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPhone(true);
      try {
        const history = await fetchTicketsByPhone(shopId, customerPhone);
        setPhoneHistoryTickets(history);
      } catch (err) {
        console.error('Error fetching phone history:', err);
      } finally {
        setIsSearchingPhone(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customerPhone, shopId]);

  const handleAddAttachment = () => {
    if (!attName.trim() || !attMime.trim() || !attSize.trim()) {
      return;
    }
    const sizeNum = Number(attSize);
    if (Number.isNaN(sizeNum) || sizeNum < 0) {
      return;
    }

    const newAtt: Attachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: attName.trim(),
      mimeType: attMime.trim(),
      sizeBytes: sizeNum,
    };

    setAttachments((prev) => [...prev, newAtt]);
    setAttName('');
    setAttMime('image/jpeg');
    setAttSize('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!shopId) {
      setFormError('ไม่พบรหัสร้านค้า');
      return;
    }

    if (!customerPhone.trim() || !customerName.trim() || !title.trim() || !description.trim()) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }

    if (!isValidPhone(customerPhone)) {
      setFormError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-15 หลัก)');
      return;
    }

    const deadlineValidation = validateDeadline(receivedAt, dueAt);
    if (!deadlineValidation.valid) {
      if (deadlineValidation.error === 'DUE_BEFORE_RECEIVED') {
        setFormError('วันครบกำหนดต้องไม่อยู่ก่อนวันที่และเวลารับเรื่อง');
      } else {
        setFormError('รูปแบบวันที่และเวลาไม่ถูกต้อง');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const input: NewTicketInput = {
        receivedAt: new Date(receivedAt).toISOString(),
        dueAt: new Date(dueAt).toISOString(),
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim(),
        contactChannel: contactChannel.trim() || undefined,
        title: title.trim(),
        type,
        priority,
        issueCategory: issueCategory.trim() || undefined,
        relatedProductService: relatedProductService.trim() || undefined,
        description: description.trim(),
        bookingId: bookingId.trim() || null,
        serviceId: serviceId.trim() || null,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : null,
        assignedTo: assignedTo.trim() || null,
        attachments,
      };

      const result = await createTicket(shopId, input);

      if (!result.ok || !result.ticket) {
        setFormError(result.error || 'บันทึกเคสไม่สำเร็จ');
        setIsSubmitting(false);
        return;
      }

      router.push(`/dashboard/tickets/${result.ticket.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกเคส');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/tickets"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="กลับหน้ารายการเคส"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-white">บันทึกรับเคสใหม่ (New Case Intake)</h1>
              <p className="text-xs text-slate-400">
                กรอกข้อมูลรับเรื่องปัญหาบริการ นัดตรวจซ้ำ หรือการเคลมสินค้า
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto w-full px-6 py-8 flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Timing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">1. วันและเวลารับเรื่อง & ครบกำหนด (Timing)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  วันที่และเวลารับเรื่อง *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  วันและเวลาครบกำหนด (Due Date) *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={receivedAt}
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Customer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
              <User className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">2. ข้อมูลลูกค้า (Customer Information)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เบอร์โทรศัพท์ลูกค้า *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 0812345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ตัวเลข 9-15 หลัก (ระบบ Normalize อัตโนมัติ)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อลูกค้า *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย ใจดี"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ช่องทางติดต่อ (Contact Channel)
                </label>
                <input
                  type="text"
                  placeholder="เช่น LINE, โทรศัพท์, หน้าร้าน"
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Duplicate Customer Phone Notice (No Autofill Rule) */}
            {phoneHistoryTickets.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                  <History className="w-4 h-4" />
                  <span>
                    พบประวัติเคสเดิมของลูกค้ารายนี้ ({phoneHistoryTickets.length} รายการ)
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  ⚠️ ระบบตรวจพบเบอร์โทรนี้ในประวัติเคสเดิม (ไม่มีการกรอกข้อมูลอัตโนมัติลงฟอร์มเพื่อความถูกต้องในการรับเรื่องใหม่)
                </p>
                <ul className="divide-y divide-amber-500/20 text-xs mt-1">
                  {phoneHistoryTickets.map((ht) => (
                    <li key={ht.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-white">{ht.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                          {STATUS_LABELS[ht.status]}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/tickets/${ht.id}`}
                        target="_blank"
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                      >
                        ดูเคสเดิม <ExternalLink className="w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 3: Case Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">3. รายละเอียดเคส (Case Details)</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                หัวข้อเรื่อง (Title) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น แอร์ไม่เย็นหลังล้างบริการ 2 วัน, ขอเปลี่ยนไซส์สินค้า"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ประเภทเคส (Case Type) *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {TICKET_TYPES.map((tp) => (
                    <option key={tp} value={tp}>
                      {TICKET_TYPE_LABELS[tp]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ระดับความสำคัญ (Priority) *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {PRIORITIES.map((pr) => (
                    <option key={pr} value={pr}>
                      {PRIORITY_LABELS[pr]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  หมวดหมู่ปัญหา (Issue Category)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ฝีมือช่าง, คุณภาพอะไหล่, ความสะอาด"
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  สินค้า/บริการที่เกี่ยวข้อง
                </label>
                <input
                  type="text"
                  placeholder="เช่น ล้างแอร์อินเวอร์เตอร์ 12000BTU"
                  value={relatedProductService}
                  onChange={(e) => setRelatedProductService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รายละเอียดปัญหา (Description) *
              </label>
              <textarea
                required
                rows={5}
                placeholder="ระบุอาการปัญหา วันที่เริ่มพบปัญหา หรือข้อเรียกร้องของลูกค้าโดยละเอียด..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Optional References */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
              <Calendar className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">
                4. ข้อมูลอ้างอิงเพิ่มเติม (Optional References)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Booking ID (รหัสการจองที่เกี่ยวข้อง)
                </label>
                <input
                  type="text"
                  placeholder="UUID ของ Booking (ถ้ามี)"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ผู้รับผิดชอบเคส (Assignee)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ช่างสมหมาย, จนท.วิภา"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  วันและเวลาที่เกิดเหตุ (Occurred At)
                </label>
                <input
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Attachment Metadata Only (Zero Binary Storage) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
              <Paperclip className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">
                5. รายการไฟล์แนบ (Attachment Metadata Only)
              </h2>
            </div>

            <p className="text-[11px] text-slate-400">
              * ขอบเขตระบบเก็บเฉพาะข้อมูลชื่อไฟล์ ประเภทไฟล์ และขนาด (Metadata) ไม่มีการจัดเก็บข้อมูลไบนารีในฐานข้อมูล
            </p>

            <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="ชื่อไฟล์ (เช่น photo_air_leak.jpg)"
                value={attName}
                onChange={(e) => setAttName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white min-w-[200px] flex-1 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="MIME Type (เช่น image/jpeg)"
                value={attMime}
                onChange={(e) => setAttMime(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-32 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                min="0"
                placeholder="ขนาด (Bytes)"
                value={attSize}
                onChange={(e) => setAttSize(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-28 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มไฟล์
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  ไฟล์ที่บันทึกแล้ว ({attachments.length}):
                </span>
                <div className="flex flex-col gap-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-medium text-white">{att.name}</span>
                        <span className="text-slate-500 text-[11px]">
                          ({att.mimeType} · {(att.sizeBytes / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/dashboard/tickets"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>กำลังบันทึกข้อมูล...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  บันทึกและสร้างเคส (Create Ticket)
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
