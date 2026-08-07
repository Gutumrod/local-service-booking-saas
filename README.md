# 🚀 Local Service Booking & LINE Automation SaaS

> **Official GitHub Repository:** [https://github.com/Gutumrod/local-service-booking-saas](https://github.com/Gutumrod/local-service-booking-saas)  
> **Live Supabase Project URL:** `https://gyleqrjdzwwlqierdwcy.supabase.co`  
> **Master Product Specification (SSOT):** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)  
> **Phase 1 Backend Integration Brief:** [`docs/technical/BRIEF_PHASE1_AGY.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/docs/technical/BRIEF_PHASE1_AGY.md)  
> **Official Business Model:** [`docs/business/OFFICIAL_BUSINESS_MODEL.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/docs/business/OFFICIAL_BUSINESS_MODEL.md)

Multi-tenant Booking, Deposit & LINE Automation SaaS designed for Local Service Businesses (Barbershops, Salons, Clinics, Spas, Auto Detailing, etc.) built for solopreneur speed, zero-friction onboarding, and 100% self-service subscription monetization.

---

## 🟢 Status: Phase 1 Backend Integration Complete (2026-08-07)

- ✅ **Supabase PostgreSQL Database Engine (`local_service` schema):** 4 Migrations applied to active project `gyleqrjdzwwlqierdwcy`. Atomic slot lock RPC `create_booking_hold` with 15-minute countdown, non-confusing booking code generator (`BK-XXXXXX`), and 2-axis status audit triggers.
- ✅ **LINE OA Webhook Gateway (`/api/line/webhook`):** Fully functional LINE Webhook Gateway with HMAC-SHA256 signature verification, parsing `ผูกคิว {booking_code}-{link_token}` commands, binding `line_users` in Supabase, and replying with custom LINE Flex Cards.
- ✅ **Single Shared Environment Configuration (`.env.local`):** Master configuration at workspace root (`.env.local`) hardlinked to both `apps/booking-consumer` and `apps/booking-admin`.
- ✅ **Frontend App Integration:** Connected `/book/[slug]` and `/dashboard` to live Supabase backend services.

---

## 📚 Master Documentation & Specifications

1. 📋 **[`PRODUCT_RULES_V1.md`](PRODUCT_RULES_V1.md):** กติกาธุรกิจ 10 ข้อหลัก (Single Source of Truth) ที่ระบบและ Database Schema อ้างอิง
2. 📄 **[`docs/technical/BRIEF_PHASE1_AGY.md`](docs/technical/BRIEF_PHASE1_AGY.md):** บรีฟงาน Phase 1 พร้อมตารางสรุปจุดเปลี่ยนสถาปัตยกรรม (Architectural Reversals & Pivots)
3. 🏆 **[`docs/business/OFFICIAL_BUSINESS_MODEL.md`](docs/business/OFFICIAL_BUSINESS_MODEL.md):** เอกสารแผนธุรกิจและสถาปัตยกรรมระบบฉบับสมบูรณ์ 100%
4. 💰 **[`docs/business/PRICING_SPEC.md`](docs/business/PRICING_SPEC.md):** ข้อกำหนดราคา สิทธิแพ็กเกจ (5/5/10 ช่าง) และแพ็กเกจเติมคิวเสริม
5. 🗺️ **[`docs/archive/ROADMAP_V2_V4.md`](docs/archive/ROADMAP_V2_V4.md):** แผนที่การดำเนินงานโครงการ V2 - V4
6. 🛡️ **[`docs/technical/ARCHITECTURE_SECURITY_STANDARD.md`](docs/technical/ARCHITECTURE_SECURITY_STANDARD.md):** มาตรฐานสถาปัตยกรรมและความปลอดภัย (Supabase Live Project `https://gyleqrjdzwwlqierdwcy.supabase.co`)

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
