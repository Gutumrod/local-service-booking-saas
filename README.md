# 🚀 Local Service Booking & LINE Automation SaaS

> **Official GitHub Repository:** [https://github.com/Gutumrod/local-service-booking-saas](https://github.com/Gutumrod/local-service-booking-saas)  
> **Live Supabase Project URL:** `https://gyleqrjdzwwlqierdwcy.supabase.co`  
> **Master Product Specification (SSOT):** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)  
> **Phase 1 Backend Integration Brief:** [`docs/technical/BRIEF_PHASE1_AGY.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/docs/technical/BRIEF_PHASE1_AGY.md)  
> **Official Business Model:** [`docs/business/OFFICIAL_BUSINESS_MODEL.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/docs/business/OFFICIAL_BUSINESS_MODEL.md)

Multi-tenant Booking, Deposit & LINE Automation SaaS designed for Local Service Businesses (Barbershops, Salons, Clinics, Spas, Auto Detailing, etc.) built for solopreneur speed, zero-friction onboarding, and 100% self-service subscription monetization.

---

## 🟢 Status: Phase A-D Complete + Phase E1-E3.3 Complete, only E4 (Billing) left (2026-08-08)

- ✅ **Supabase PostgreSQL Database Engine (`local_service` schema):** All migrations under `supabase/migrations/` applied and verified against the live project `gyleqrjdzwwlqierdwcy`. Atomic slot lock RPC `create_booking_hold` with 15-minute countdown, non-confusing booking code generator (`BK-XXXXXX`), 2-axis status audit triggers, and a real Postgres exclusion constraint (`prevent_overlapping_staff_bookings`) verified under concurrent load — see [`docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md`](docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md).
- ✅ **LINE OA Webhook Gateway (`/api/line/webhook`):** Uses a server-only `SUPABASE_SERVICE_ROLE_KEY` admin client (Phase B) instead of the anon key RLS used to block silently. HMAC-SHA256 signature verification with `crypto.timingSafeEqual`, parses `ผูกคิว {booking_code}-{link_token}` commands, binds `line_users`, replies with LINE Flex Cards, and reports real per-event failures instead of a blanket `success:true`.
- ✅ **Single Shared Environment Configuration (`.env.local`):** Master configuration at workspace root (`.env.local`) hardlinked to both `apps/booking-consumer` and `apps/booking-admin`.
- ✅ **Consumer booking flow (`/book/[slug]`):** Connected to live Supabase backend and manually verified end-to-end (hold → deposit slip upload to Storage → status transitions), with fail-closed staff scheduling and a proper no-deposit success path (Phase C).
- ✅ **Shop owner dashboard (`/dashboard`) — real Supabase Auth login + 5 of 6 tabs wired to live data.** Owners/admins/staff sign in via Supabase Auth (`/login`), `/register` provisions a real shop + owner membership atomically. Bookings, Services, Staff, Schedules/Holidays, and Settings tabs all load and mutate real tenant-scoped data through role-checked RPCs (owner/admin/staff enforced per `PRODUCT_RULES_V1.md` §7). Billing remains mock, tracked as Phase E4 in [`docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md`](docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md).
- ✅ **`shops` table column-exposure fix (Phase E3.3):** the table previously let any unauthenticated caller `select=*` and read `subscription_status`, `trial_ends_at`, `owner_name`, and other internal columns for any shop whose public slug they knew. Fixed with a column-limited `shop_public_profile` view for anon reads and an owner-only `update_shop_settings` RPC for writes — see [`docs/technical/PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md`](docs/technical/PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md).

---

## 📚 Master Documentation & Specifications

1. 📋 **[`PRODUCT_RULES_V1.md`](PRODUCT_RULES_V1.md):** กติกาธุรกิจ 10 ข้อหลัก (Single Source of Truth) ที่ระบบและ Database Schema อ้างอิง
2. 📄 **[`docs/technical/BRIEF_PHASE1_AGY.md`](docs/technical/BRIEF_PHASE1_AGY.md):** บรีฟงาน Phase 1 พร้อมตารางสรุปจุดเปลี่ยนสถาปัตยกรรม (Architectural Reversals & Pivots)
3. 🛠️ **[`docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md`](docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md):** แผนงาน Phase A-E (data integrity/authorization hardening → LINE webhook fix → frontend fixes → docs → admin dashboard wiring) พร้อม Definition of Done แต่ละเฟส
4. ✅ **[`docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md`](docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md):** รายงานผลการ apply + verify Phase A จริงบน live database
5. 🏆 **[`docs/business/OFFICIAL_BUSINESS_MODEL.md`](docs/business/OFFICIAL_BUSINESS_MODEL.md):** เอกสารแผนธุรกิจและสถาปัตยกรรมระบบฉบับสมบูรณ์ 100%
6. 💰 **[`docs/business/PRICING_SPEC.md`](docs/business/PRICING_SPEC.md):** ข้อกำหนดราคา สิทธิแพ็กเกจ (5/5/10 ช่าง) และแพ็กเกจเติมคิวเสริม
7. 🗺️ **[`docs/archive/ROADMAP_V2_V4.md`](docs/archive/ROADMAP_V2_V4.md):** แผนที่การดำเนินงานโครงการ V2 - V4
8. 🛡️ **[`docs/technical/ARCHITECTURE_SECURITY_STANDARD.md`](docs/technical/ARCHITECTURE_SECURITY_STANDARD.md):** มาตรฐานสถาปัตยกรรมและความปลอดภัย (Supabase Live Project `https://gyleqrjdzwwlqierdwcy.supabase.co`)

---

## 🌟 Key Features

- **Zero-Friction Central LINE OA Automation:** Central system bot notifies customers and shop owners automatically without requiring shop owners to set up LINE Developers accounts.
- **Service & Staff Management:** Flexible service items, pricing, duration, staff schedules, lunch breaks, and shop operating hours (09:00 - 20:00).
- **PromptPay QR Deposit:** Server-generated PromptPay QR codes with unique transaction reference checks to eliminate No-Shows.
- **Automated LINE Reminders (Pro Tier):** Automated reminders sent 24h & 1h before appointment to reduce no-shows.
- **Self-Service Subscription Model:** 14-day Free Trial -> Basic 490 THB/mo -> Pro 990 THB/mo managed via Stripe Single Provider Standard.

---

## 🛠️ Architecture

- **Consumer Web App (`apps/booking-consumer`):** Mobile-first customer booking portal (`/book/[slug]`) + LINE messaging auto-link binding + LINE Webhook Gateway (`/api/line/webhook`).
- **Store Owner Dashboard (`apps/booking-admin`):** Admin panel (`/dashboard`) for managing bookings, staff schedules, deposit verification, and billing.
- **Platform Super Admin Panel (`apps/booking-admin/src/app/platform-admin`):** CEO Control Center (`/platform-admin`) for managing tenant shops, MRR analytics, subscription overrides, shop cancellation controls, and Central LINE OA traffic monitoring.
- **Database & Auth (`supabase/`):** Multi-tenant PostgreSQL database (`https://gyleqrjdzwwlqierdwcy.supabase.co`) with Row-Level Security (RLS), Postgres Range Exclusion Constraints, and custom RPCs.

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/Gutumrod/local-service-booking-saas.git
cd local-service-booking-saas

# Install dependencies
npm install

# Run consumer booking app (Port 3000)
npm run dev:shop

# Run shop admin dashboard (Port 3001)
npm run dev:admin
```

### ⚠️ Required manual step on any fresh Supabase project

After applying all migrations in `supabase/migrations/` to a new/fresh Supabase project, you **must** manually add `local_service` to **Exposed schemas**: Supabase Dashboard → Project Settings → API → Data API → Exposed schemas. This cannot be done via SQL, the Management API, or any known Supabase CLI/MCP tool — it is Dashboard-UI-only. Skipping this step makes every table/RPC call return `406 PGRST106: Invalid schema` even though the schema and RLS grants are otherwise correct. This bit the team once already (2026-08-07) before being diagnosed.
