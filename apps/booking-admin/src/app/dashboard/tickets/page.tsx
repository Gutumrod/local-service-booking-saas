'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchTickets,
  getCurrentShopMembership,
  previewRetentionCleanup,
  deleteClosedTicketsBefore,
} from '@/lib/ticket-service';
import {
  defaultRetentionCutoff,
  isOverdue,
  STATUS_LABELS,
  TICKET_TYPE_LABELS,
  PRIORITY_LABELS,
  type Priority,
  type RetentionCandidate,
  type Status,
  type Ticket,
  type TicketSearchFilters,
  type TicketType,
} from '@/lib/ticket-domain';
import {
  Search,
  Plus,
  ArrowLeft,
  Filter,
  AlertTriangle,
  Clock,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Phone,
  User,
  Tag,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const STATUS_LIST: Status[] = [
  'New',
  'Acknowledged',
  'InReview',
  'WaitingForCustomer',
  'RecheckScheduled',
  'Resolved',
  'Closed',
  'Reopened',
];

const TYPE_LIST: TicketType[] = [
  'ProductClaim',
  'ServiceIssue',
  'RecheckRequest',
  'RefundRequest',
  'Other',
];

function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusBadge(status: Status) {
  switch (status) {
    case 'New':
      return 'text-sky-300 bg-sky-500/10 border-sky-500/30';
    case 'Acknowledged':
      return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
    case 'InReview':
      return 'text-purple-300 bg-purple-500/10 border-purple-500/30';
    case 'WaitingForCustomer':
      return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    case 'RecheckScheduled':
      return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30';
    case 'Resolved':
      return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    case 'Closed':
      return 'text-slate-400 bg-slate-800 border-slate-700';
    case 'Reopened':
      return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
    default:
      return 'text-slate-300 bg-slate-800 border-slate-700';
  }
}

function getPriorityBadge(priority: Priority) {
  switch (priority) {
    case 'High':
      return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
    case 'Medium':
      return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    case 'Low':
      return 'text-slate-300 bg-slate-800 border-slate-700';
  }
}

export default function TicketsHistoryPage() {
  const [shopId, setShopId] = useState<string>('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Status | ''>('');
  const [selectedType, setSelectedType] = useState<TicketType | ''>('');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [receivedTo, setReceivedTo] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Retention Cleanup State
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [retentionCutoff, setRetentionCutoff] = useState(() => defaultRetentionCutoff());
  const [retentionCandidates, setRetentionCandidates] = useState<RetentionCandidate[] | null>(null);
  const [isRetentionPreviewing, setIsRetentionPreviewing] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [retentionFeedback, setRetentionFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Load Membership and Initial Tickets
  const loadTickets = useCallback(async (targetShopId?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let activeShopId = targetShopId || shopId;
      if (!activeShopId) {
        const membership = await getCurrentShopMembership();
        activeShopId = membership.shopId;
        setShopId(activeShopId);
      }

      const filters: TicketSearchFilters = {
        query: searchQuery,
        statuses: selectedStatus ? [selectedStatus] : undefined,
        types: selectedType ? [selectedType] : undefined,
        receivedFrom: receivedFrom ? `${receivedFrom}T00:00:00.000Z` : undefined,
        receivedTo: receivedTo ? `${receivedTo}T23:59:59.999Z` : undefined,
        overdueOnly,
        now: new Date().toISOString(),
      };

      const data = await fetchTickets(activeShopId, filters);
      setTickets(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'โหลดข้อมูลเคสไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, searchQuery, selectedStatus, selectedType, receivedFrom, receivedTo, overdueOnly]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedType('');
    setReceivedFrom('');
    setReceivedTo('');
    setOverdueOnly(false);
  };

  // Retention Preview
  const handlePreviewRetention = async () => {
    if (!shopId) return;
    setIsRetentionPreviewing(true);
    setRetentionFeedback(null);
    try {
      const candidates = await previewRetentionCleanup(shopId, retentionCutoff);
      setRetentionCandidates(candidates);
    } catch (err) {
      setRetentionFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'ตรวจสอบรายการไม่สำเร็จ',
      });
    } finally {
      setIsRetentionPreviewing(false);
    }
  };

  // Retention Delete Execution (Two-step confirmed)
  const handleExecuteRetentionDelete = async () => {
    if (!shopId || deleteConfirmationPhrase !== 'DELETE') return;
    setIsDeleting(true);
    setRetentionFeedback(null);
    try {
      const result = await deleteClosedTicketsBefore(shopId, retentionCutoff);
      if (!result.ok) {
        setRetentionFeedback({ kind: 'err', text: result.error || 'ลบข้อมูลไม่สำเร็จ' });
      } else {
        setRetentionFeedback({
          kind: 'ok',
          text: `ล้างข้อมูลสำเร็จแล้ว จำนวน ${result.deletedCount} รายการ`,
        });
        setRetentionCandidates([]);
        setDeleteConfirmationOpen(false);
        setDeleteConfirmationPhrase('');
        await loadTickets();
      }
    } catch (err) {
      setRetentionFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบข้อมูล',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="กลับหน้าแดชบอร์ดหลัก"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white">ระบบจัดการเคส & เคลมบริการ (Tickets)</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {tickets.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ประวัติเคส ปัญหาบริการ นัดตรวจซ้ำ และการเคลมสินค้า
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowRetentionModal(true);
                setRetentionCandidates(null);
                setRetentionFeedback(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              ล้างข้อมูลเคสเก่า (Retention)
            </button>

            <Link
              href="/dashboard/tickets/new"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              รับเคสใหม่ (New Ticket)
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter Controls Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วย เลขเคส, ชื่อลูกค้า, เบอร์โทร หรือหัวข้อ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Status | '')}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">ทุกสถานะ (All Statuses)</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TicketType | '')}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">ทุกประเภทเคส (All Types)</option>
              {TYPE_LIST.map((tp) => (
                <option key={tp} value={tp}>
                  {TICKET_TYPE_LABELS[tp]}
                </option>
              ))}
            </select>

            {/* Date From */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-[11px] text-slate-500">ตั้งแต่:</span>
              <input
                type="date"
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-[11px] text-slate-500">ถึง:</span>
              <input
                type="date"
                value={receivedTo}
                onChange={(e) => setReceivedTo(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              />
            </div>

            {/* Overdue Only Checkbox */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 bg-slate-900"
              />
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                เฉพาะเคสเกินกำหนด (Overdue)
              </span>
            </label>

            {/* Clear Filters Button */}
            {(searchQuery || selectedStatus || selectedType || receivedFrom || receivedTo || overdueOnly) && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                ล้างตัวกรอง
              </button>
            )}

            <button
              onClick={() => loadTickets()}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tickets Table / List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm">กำลังโหลดข้อมูลเคส...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-20 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
                <Tag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">ไม่พบรายการเคสที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                ยังไม่มีการบันทึกเคสในร้าน หรือไม่มีรายการที่ตรงกับคำค้นหาและตัวกรองที่เลือก
              </p>
              <div className="flex gap-3">
                {(searchQuery || selectedStatus || selectedType || receivedFrom || receivedTo || overdueOnly) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
                <Link
                  href="/dashboard/tickets/new"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
                >
                  + รับเคสใหม่ทันที
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                    <th className="py-3.5 px-4">เคส / ประเภท</th>
                    <th className="py-3.5 px-4">ลูกค้า</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4">ความสำคัญ</th>
                    <th className="py-3.5 px-4">วันที่รับเรื่อง</th>
                    <th className="py-3.5 px-4">วันครบกำหนด</th>
                    <th className="py-3.5 px-4">ผู้รับผิดชอบ</th>
                    <th className="py-3.5 px-4 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tickets.map((t) => {
                    const overdue = isOverdue(t);
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      >
                        {/* Ticket ID & Type */}
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/tickets/${t.id}`} className="block">
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-slate-400">
                                {t.id.slice(0, 8)}...
                              </span>
                              <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                {TICKET_TYPE_LABELS[t.type]}
                              </span>
                            </div>
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{t.customer.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {t.customer.phone}
                          </div>
                        </td>

                        {/* Status & Overdue */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                t.status
                              )}`}
                            >
                              {STATUS_LABELS[t.status]}
                            </span>
                            {overdue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                เกินกำหนด
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityBadge(
                              t.priority
                            )}`}
                          >
                            {PRIORITY_LABELS[t.priority]}
                          </span>
                        </td>

                        {/* Received At */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {formatDateTime(t.receivedAt)}
                        </td>

                        {/* Due At */}
                        <td className="py-3.5 px-4">
                          <span
                            className={overdue ? 'text-rose-400 font-semibold' : 'text-slate-300'}
                          >
                            {formatDateTime(t.dueAt)}
                          </span>
                        </td>

                        {/* Assignee */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {t.assignedTo ? (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {t.assignedTo}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">ยังไม่มอบหมาย</span>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/tickets/${t.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors"
                          >
                            ดูรายละเอียด
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Manual Retention Cleanup Modal */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  ล้างข้อมูลเคสเก่าที่ปิดแล้ว (Retention Cleanup)
                </h3>
              </div>
              <button
                onClick={() => setShowRetentionModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ฟังก์ชันนี้เป็นคำสั่งแบบ Manual (สองขั้นตอน) สำหรับตรวจสอบและล้างเคสที่อยู่ในสถานะ{' '}
              <strong className="text-white">Closed (ปิดเคสแล้ว)</strong> ที่มีอายุเกินกำหนดนโยบาย
              (เช่น 12 เดือน) เพื่อประหยัดพื้นที่ฐานข้อมูล โดยระบบจะไม่มีการลบข้อมูลแบบอัตโนมัติเด็ดขาด
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-300 font-medium">
                เลือกวันที่ตัดรอบ (Cutoff Date):
              </label>
              <input
                type="date"
                value={retentionCutoff}
                onChange={(e) => {
                  setRetentionCutoff(e.target.value);
                  setRetentionCandidates(null);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handlePreviewRetention}
                disabled={isRetentionPreviewing}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                {isRetentionPreviewing ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรายการที่เข้าเกณฑ์'}
              </button>
            </div>

            {retentionFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  retentionFeedback.kind === 'ok'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {retentionFeedback.kind === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{retentionFeedback.text}</span>
              </div>
            )}

            {/* Preview Results */}
            {retentionCandidates !== null && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    พบเคสปิดที่เข้าเกณฑ์: {retentionCandidates.length} รายการ
                  </span>
                </div>

                {retentionCandidates.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center bg-slate-950 rounded-xl">
                    ไม่มีเคส Closed ที่ปิดก่อนวันที่ระบุ
                  </p>
                ) : (
                  <>
                    <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 divide-y divide-slate-800/60">
                      {retentionCandidates.map((c) => (
                        <div key={c.id} className="p-3 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-white">{c.title}</span>
                            <span className="text-slate-500 ml-2">({c.customerName})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 shrink-0">
                            ปิดเมื่อ: {formatDateTime(c.closedAt)} · แนบ {c.attachmentCount} ไฟล์
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setDeleteConfirmationOpen(true)}
                      className="self-end px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      เปิดหน้าต่างยืนยันการลบ ({retentionCandidates.length} รายการ)
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRetentionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Explicit DELETE Confirmation Modal */}
      {deleteConfirmationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">ยืนยันการลบข้อมูลถาวร</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              การดำเนินการนี้จะลบเคสที่ปิดแล้วจำนวน{' '}
              <strong className="text-rose-400 font-bold">{retentionCandidates?.length || 0}</strong>{' '}
              รายการออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">
                พิมพ์คำว่า <span className="text-rose-400 font-bold font-mono">DELETE</span> เพื่อยืนยัน:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmationPhrase}
                onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setDeleteConfirmationOpen(false);
                  setDeleteConfirmationPhrase('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleExecuteRetentionDelete}
                disabled={deleteConfirmationPhrase !== 'DELETE' || isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบถาวร'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
