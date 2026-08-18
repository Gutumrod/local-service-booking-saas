'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchTicketById,
  updateTicketStatus,
  appendTimelineEntry,
  updateTicketPriority,
  updateTicketAssignee,
  saveTicketResolution,
  closeTicket,
  reopenTicket,
  getCurrentShopMembership,
} from '@/lib/ticket-service';
import {
  canTransition,
  getTransitionError,
  isOverdue,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
  ALLOWED_TRANSITIONS,
  type Priority,
  type Status,
  type Ticket,
  type TicketType,
  type TimelineEntry,
  type TimelineEventType,
  type Attachment,
} from '@/lib/ticket-domain';
import {
  ArrowLeft,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  User,
  Phone,
  Tag,
  MessageSquare,
  Send,
  ShieldAlert,
  Check,
  Edit3,
  Save,
  RefreshCw,
  Paperclip,
  ChevronRight,
  FileText,
  Activity,
  AlertCircle,
  Sparkles,
  X,
  Plus,
  Copy,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
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

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

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

function getTimelineEventIcon(eventType: TimelineEventType) {
  switch (eventType) {
    case 'Created':
      return <Plus className="w-3.5 h-3.5 text-emerald-400" />;
    case 'StatusChanged':
      return <Activity className="w-3.5 h-3.5 text-sky-400" />;
    case 'PriorityChanged':
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case 'AssigneeChanged':
      return <User className="w-3.5 h-3.5 text-indigo-400" />;
    case 'CommentAdded':
      return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
    case 'ResolutionSaved':
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    case 'Closed':
      return <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />;
    case 'Reopened':
      return <RotateCcw className="w-3.5 h-3.5 text-rose-400" />;
    default:
      return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  }
}

export default function TicketDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const rawId = routeParams?.id;
  const ticketId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';

  // Core State
  const [shopId, setShopId] = useState<string>('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Interactive Action States
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);
  const [isSavingResolution, setIsSavingResolution] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Form Fields for Controls
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Medium');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Load Membership and Ticket Data
  const loadTicketData = useCallback(async () => {
    if (!ticketId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setActionError('');
    try {
      let activeShopId = shopId;
      if (!activeShopId) {
        const membership = await getCurrentShopMembership();
        activeShopId = membership.shopId;
        setShopId(activeShopId);
      }

      const data = await fetchTicketById(activeShopId, ticketId);
      if (!data) {
        setNotFound(true);
        setTicket(null);
      } else {
        setNotFound(false);
        setTicket(data);
        setSelectedPriority(data.priority);
        setAssigneeInput(data.assignedTo || '');
        setResolutionInput(data.resolution || '');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'โหลดข้อมูลเคสไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, ticketId]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Copy helpers
  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPhone = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.customer.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Status Transitions
  const handleStatusTransition = async (targetStatus: Status) => {
    if (!ticket || !shopId) return;

    setActionError('');
    setActionSuccess('');
    setIsUpdatingStatus(true);

    try {
      let result: { ok: boolean; ticket?: Ticket; error?: string };

      if (targetStatus === 'Closed') {
        result = await closeTicket(shopId, ticket.id);
      } else if (targetStatus === 'Reopened') {
        result = await reopenTicket(shopId, ticket.id);
      } else {
        result = await updateTicketStatus(shopId, ticket.id, targetStatus);
      }

      if (!result.ok) {
        setActionError(result.error || 'เปลี่ยนสถานะไม่สำเร็จ');
      } else {
        setActionSuccess(`เปลี่ยนสถานะเป็น "${STATUS_LABELS[targetStatus]}" สำเร็จแล้ว`);
        if (result.ticket) {
          setTicket(result.ticket);
        } else {
          await loadTicketData();
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Priority Update
  const handlePriorityChange = async (newPriority: Priority) => {
    if (!ticket || !shopId || newPriority === ticket.priority) return;

    setActionError('');
    setActionSuccess('');
    setIsUpdatingPriority(true);

    try {
      const result = await updateTicketPriority(shopId, ticket.id, newPriority);
      if (!result.ok) {
        setActionError(result.error || 'เปลี่ยนระดับความสำคัญไม่สำเร็จ');
      } else {
        setActionSuccess(`เปลี่ยนระดับความสำคัญเป็น "${PRIORITY_LABELS[newPriority]}" สำเร็จแล้ว`);
        setSelectedPriority(newPriority);
        if (result.ticket) {
          setTicket(result.ticket);
        } else {
          await loadTicketData();
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเปลี่ยนความสำคัญ');
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Assignee Update
  const handleAssigneeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !shopId) return;

    setActionError('');
    setActionSuccess('');
    setIsUpdatingAssignee(true);

    try {
      const result = await updateTicketAssignee(shopId, ticket.id, assigneeInput.trim() || null);
      if (!result.ok) {
        setActionError(result.error || 'เปลี่ยนผู้รับผิดชอบไม่สำเร็จ');
      } else {
        setActionSuccess(
          assigneeInput.trim()
            ? `มอบหมายงานให้ "${assigneeInput.trim()}" สำเร็จแล้ว`
            : 'ยกเลิกการมอบหมายงานสำเร็จแล้ว'
        );
        if (result.ticket) {
          setTicket(result.ticket);
        } else {
          await loadTicketData();
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตผู้รับผิดชอบ');
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  // Save Resolution
  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !shopId) return;

    if (!resolutionInput.trim()) {
      setActionError('กรุณากรอกรายละเอียดผลการแก้ไข (Resolution)');
      return;
    }

    setActionError('');
    setActionSuccess('');
    setIsSavingResolution(true);

    try {
      const result = await saveTicketResolution(shopId, ticket.id, resolutionInput.trim());
      if (!result.ok) {
        setActionError(result.error || 'บันทึกผลการแก้ไขไม่สำเร็จ');
      } else {
        setActionSuccess('บันทึกผลการแก้ไข (Resolution) สำเร็จแล้ว');
        if (result.ticket) {
          setTicket(result.ticket);
        } else {
          await loadTicketData();
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกผลการแก้ไข');
    } finally {
      setIsSavingResolution(false);
    }
  };

  // Add Comment / Timeline Entry
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !shopId) return;

    if (!commentInput.trim()) {
      setActionError('กรุณากรอกข้อความความคิดเห็น');
      return;
    }

    setActionError('');
    setActionSuccess('');
    setIsAddingComment(true);

    try {
      const result = await appendTimelineEntry(shopId, ticket.id, {
        eventType: 'CommentAdded',
        message: commentInput.trim(),
        actor: 'staff',
      });

      if (!result.ok) {
        setActionError(result.error || 'บันทึกความคิดเห็นไม่สำเร็จ');
      } else {
        setActionSuccess('เพิ่มความคิดเห็นลงในไทม์ไลน์เรียบร้อยแล้ว');
        setCommentInput('');
        await loadTicketData();
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกความคิดเห็น');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Loading State
  if (isLoading && !ticket) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
        <header className="bg-slate-900/80 border-b border-slate-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <Link
              href="/dashboard/tickets"
              className="p-2 rounded-xl bg-slate-800 text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto w-full px-6 py-20 flex-1 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm text-slate-400">กำลังโหลดรายละเอียดเคส...</p>
        </main>
      </div>
    );
  }

  // Not Found State
  if (notFound || !ticket) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
        <header className="bg-slate-900/80 border-b border-slate-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <Link
              href="/dashboard/tickets"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg text-white">รายละเอียดเคส (Ticket Detail)</h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto w-full px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">ไม่พบข้อมูลเคสที่ระบุ</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            รหัสเคสนี้อาจไม่มีอยู่จริงในร้านค้าของคุณ หรือถูกลบออกจากการล้างข้อมูลเก่าแล้ว
          </p>
          <Link
            href="/dashboard/tickets"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้ารายการเคส
          </Link>
        </main>
      </div>
    );
  }

  const overdue = isOverdue(ticket);
  const availableTransitions = ALLOWED_TRANSITIONS[ticket.status] || [];
  const showResolutionPrompt =
    ticket.status === 'InReview' ||
    ticket.status === 'RecheckScheduled' ||
    ticket.status === 'Resolved' ||
    ticket.status === 'Closed' ||
    Boolean(ticket.resolution);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Sticky Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/tickets"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="กลับหน้ารายการเคส"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-lg text-white truncate max-w-md">
                  {ticket.title}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {STATUS_LABELS[ticket.status]}
                </span>
                {overdue && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    เกินกำหนด (Overdue)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  ID: {ticket.id}
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-slate-500 hover:text-white p-0.5"
                    title="คัดลอก Ticket ID"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {TICKET_TYPE_LABELS[ticket.type]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTicketData()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/dashboard/tickets/new"
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              รับเคสใหม่
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Global Action Error Banner */}
        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError('')}
              className="text-rose-400 hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Action Success Banner */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess('')}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN: Main Details, Customer, Resolution & Timeline (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Case Details Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FileText className="w-4 h-4" />
                  <h2 className="text-sm font-bold text-white">รายละเอียดเคส (Case Information)</h2>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(
                    ticket.priority
                  )}`}
                >
                  ความสำคัญ: {PRIORITY_LABELS[ticket.priority]}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">{ticket.title}</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">หมวดหมู่ปัญหา (Category)</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {ticket.issueCategory || <span className="text-slate-600 font-normal">ไม่ระบุ</span>}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">สินค้า / บริการที่เกี่ยวข้อง</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {ticket.relatedProductService || (
                      <span className="text-slate-600 font-normal">ไม่ระบุ</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Booking Reference Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                <User className="w-4 h-4" />
                <h2 className="text-sm font-bold text-white">ข้อมูลลูกค้าและการจอง (Customer & Booking)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">ชื่อลูกค้า</span>
                  <span className="text-xs font-bold text-white">{ticket.customer.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{ticket.customerId}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">เบอร์โทรศัพท์</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${ticket.customer.phone}`}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {ticket.customer.phone}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-slate-500 hover:text-white p-0.5"
                      title="คัดลอกเบอร์โทร"
                    >
                      {copiedPhone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Norm: {ticket.normalizedPhone}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">ช่องทางติดต่อ</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {ticket.customer.contactChannel || (
                      <span className="text-slate-600 font-normal">ไม่ระบุ</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Linked Booking Reference if available */}
              {ticket.bookingRef ? (
                <div className="mt-1 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      เชื่อมโยงกับการจอง (Linked Booking)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {ticket.bookingRef.bookingId.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">บริการ</span>
                      <span className="font-semibold text-slate-200">
                        {ticket.bookingRef.serviceName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ช่างผู้ให้บริการ</span>
                      <span className="font-semibold text-slate-200">
                        {ticket.bookingRef.providerTechnician || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">สาขา</span>
                      <span className="font-semibold text-slate-200">
                        {ticket.bookingRef.shopBranch}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">วันที่รับบริการ</span>
                      <span className="font-semibold text-slate-200">
                        {formatDateTime(ticket.bookingRef.serviceDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : ticket.bookingId ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Booking ID อ้างอิง:</span>
                  <span className="font-mono text-slate-200">{ticket.bookingId}</span>
                </div>
              ) : null}
            </div>

            {/* Resolution Section (Prominently displayed when applicable) */}
            {showResolutionPrompt && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <h2 className="text-sm font-bold text-white">
                      ผลการแก้ไข & ข้อยุติ (Ticket Resolution)
                    </h2>
                  </div>
                  {ticket.status === 'Closed' && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      ปิดเคสเมื่อ: {formatDateTime(ticket.closedAt)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  บันทึกแนวทางการแก้ปัญหา ข้อยุติ หรือผลการชดเชยให้ลูกค้า (จำเป็นต้องมี Resolution
                  ก่อนจึงจะสามารถกดปิดเคส Closed ได้)
                </p>

                <form onSubmit={handleSaveResolution} className="flex flex-col gap-3">
                  <textarea
                    rows={4}
                    placeholder="ระบุข้อสรุปการแก้ไข เช่น เปลี่ยนสินค้าชิ้นใหม่ให้ลูกค้า, นัดตรวจซ้ำเรียบร้อย, คืนเงินค่าบริการ 100%..."
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    disabled={isSavingResolution}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      {ticket.resolution
                        ? '✔️ มีการบันทึกผลการแก้ไขแล้ว สามารถแก้ไขเพิ่มเติมได้'
                        : '⚠️ ยังไม่มีการบันทึกผลการแก้ไข'}
                    </span>
                    <button
                      type="submit"
                      disabled={isSavingResolution || !resolutionInput.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingResolution ? 'กำลังบันทึก...' : 'บันทึกผลการแก้ไข (Save Resolution)'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Timeline & Comments Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Activity className="w-4 h-4" />
                  <h2 className="text-sm font-bold text-white">
                    ประวัติกิจกรรม & ไทม์ไลน์ (Timeline & History)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {ticket.timeline.length} รายการกิจกรรม
                </span>
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-300">
                  เพิ่มบันทึก / ความคิดเห็นภายในทีม (Add Internal Note)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="พิมพ์บันทึกหรือข้อความอัปเดต..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    disabled={isAddingComment}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingComment || !commentInput.trim()}
                    className="px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    ส่ง
                  </button>
                </div>
              </form>

              {/* Timeline List */}
              <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {ticket.timeline.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 italic">ยังไม่มีกิจกรรมในไทม์ไลน์</p>
                ) : (
                  ticket.timeline.map((entry, idx) => (
                    <div key={entry.id || idx} className="relative flex flex-col gap-1">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow">
                        {getTimelineEventIcon(entry.eventType)}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <span className="text-[11px] text-emerald-400 font-mono">
                              [{entry.eventType}]
                            </span>
                            {entry.actor && (
                              <span className="text-slate-400 text-[11px]">โดย {entry.actor}</span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed mt-0.5 whitespace-pre-wrap">
                          {entry.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Controls, Status Lifecycle, Priority, Assignee & Meta (Span 1) */}
          <div className="flex flex-col gap-6">
            {/* Status Transition Control Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  เปลี่ยนสถานะเคส (Status Workflow)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {STATUS_LABELS[ticket.status]}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  สถานะถัดไปที่สามารถเปลี่ยนได้:
                </span>

                {availableTransitions.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                    ไม่มีสถานะที่สามารถเปลี่ยนได้โดยตรง
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {availableTransitions.map((target) => {
                      const isCloseAction = target === 'Closed';
                      const isReopenAction = target === 'Reopened';

                      let btnStyle =
                        'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-200';
                      if (isCloseAction) {
                        btnStyle =
                          'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white';
                      } else if (isReopenAction) {
                        btnStyle =
                          'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 text-rose-300';
                      } else if (target === 'Resolved') {
                        btnStyle =
                          'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300';
                      } else if (target === 'InReview') {
                        btnStyle =
                          'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-300';
                      }

                      return (
                        <button
                          key={target}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleStatusTransition(target)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all disabled:opacity-50 ${btnStyle}`}
                        >
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                            {STATUS_LABELS[target]}
                          </span>
                          {isCloseAction && (
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              ต้องมี Resolution
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Priority Management Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                ระดับความสำคัญ (Priority)
              </span>

              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((pr) => {
                  const isSelected = ticket.priority === pr;
                  return (
                    <button
                      key={pr}
                      type="button"
                      disabled={isUpdatingPriority || isSelected}
                      onClick={() => handlePriorityChange(pr)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? getPriorityBadge(pr) + ' ring-1 ring-white/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {pr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee Management Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <User className="w-4 h-4 text-indigo-400" />
                ผู้รับผิดชอบเคส (Assignee)
              </span>

              <form onSubmit={handleAssigneeSubmit} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น ช่างสมหมาย, จนท.วิภา"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    disabled={isUpdatingAssignee}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingAssignee}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    {isUpdatingAssignee ? '...' : 'บันทึก'}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">
                  {ticket.assignedTo
                    ? `ปัจจุบันมอบหมาย: ${ticket.assignedTo}`
                    : 'ยังไม่ได้มอบหมายงานให้ผู้ใด (สามารถเว้นว่างเพื่อยกเลิกได้)'}
                </span>
              </form>
            </div>

            {/* Key Dates & SLA Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <Clock className="w-4 h-4 text-sky-400" />
                กำหนดการ & วันเวลา (SLA & Dates)
              </span>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">วันที่รับเรื่อง:</span>
                  <span className="font-medium text-white">
                    {formatDateTime(ticket.receivedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">วันครบกำหนด (Due):</span>
                  <span
                    className={
                      overdue ? 'font-bold text-rose-400' : 'font-medium text-white'
                    }
                  >
                    {formatDateTime(ticket.dueAt)}
                  </span>
                </div>

                {ticket.occurredAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">วันที่เกิดเหตุ:</span>
                    <span className="font-medium text-slate-300">
                      {formatDateTime(ticket.occurredAt)}
                    </span>
                  </div>
                )}

                {ticket.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">วันที่ปิดเคส:</span>
                    <span className="font-medium text-slate-300">
                      {formatDateTime(ticket.closedAt)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>สร้างเมื่อ:</span>
                  <span>{formatDateTime(ticket.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-400" />
                    ไฟล์แนบ ({ticket.attachments.length})
                  </span>
                  <span className="text-[10px] text-slate-500">Metadata</span>
                </div>

                <div className="flex flex-col gap-2">
                  {ticket.attachments.map((att: Attachment) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-white truncate">{att.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                        {(att.sizeBytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
