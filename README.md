# 🚀 Local Service Booking & LINE Automation SaaS

> **Official GitHub Repository:** [https://github.com/Gutumrod/local-service-booking-saas](https://github.com/Gutumrod/local-service-booking-saas)  
> **Master Product Specification (SSOT):** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)  
> **Phase 1 Implementation Brief:** [`BRIEF_PHASE1_AGY.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/BRIEF_PHASE1_AGY.md)  
> **Official Business Model:** [`OFFICIAL_BUSINESS_MODEL.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/OFFICIAL_BUSINESS_MODEL.md)

Multi-tenant Booking, Deposit & LINE Automation SaaS designed for Local Service Businesses (Barbershops, Salons, Clinics, Spas, Auto Detailing, etc.) built for solopreneur speed, zero-friction onboarding, and 100% self-service subscription monetization.

---

## 📚 Master Documentation & Specifications

1. 📋 **[`PRODUCT_RULES_V1.md`](PRODUCT_RULES_V1.md):** กติกาธุรกิจ 10 ข้อหลัก (Single Source of Truth) ที่ระบบและ Database Schema อ้างอิง
2. 📄 **[`BRIEF_PHASE1_AGY.md`](BRIEF_PHASE1_AGY.md):** บรีฟงาน Phase 1 พร้อมตารางสรุปจุดเปลี่ยนสถาปัตยกรรม (Architectural Reversals & Pivots)
3. 🏆 **[`OFFICIAL_BUSINESS_MODEL.md`](OFFICIAL_BUSINESS_MODEL.md):** เอกสารแผนธุรกิจและสถาปัตยกรรมระบบฉบับสมบูรณ์ 100%
4. 💰 **[`PRICING_SPEC.md`](PRICING_SPEC.md):** ข้อกำหนดราคา สิทธิแพ็กเกจ (5/5/10 ช่าง) และแพ็กเกจเติมคิวเสริม
5. 🗺️ **[`ROADMAP_V2_V4.md`](ROADMAP_V2_V4.md):** แผนที่การดำเนินงานโครงการ V2 - V4
6. 🛡️ **[`ARCHITECTURE_SECURITY_STANDARD.md`](ARCHITECTURE_SECURITY_STANDARD.md):** มาตรฐานสถาปัตยกรรมและความปลอดภัย (Supabase RLS & Central LINE Bot)

---

## 🌟 Key Features

- **Zero-Friction Central LINE OA Automation:** Central system bot notifies customers and shop owners automatically without requiring shop owners to set up LINE Developers accounts.
- **Service & Staff Management:** Flexible service items, pricing, duration, staff schedules, lunch breaks, and shop operating hours (09:00 - 20:00).
- **PromptPay QR Deposit:** Server-generated PromptPay QR codes with unique transaction reference checks to eliminate No-Shows.
- **Automated LINE Reminders (Pro Tier):** Automated reminders sent 24h & 1h before appointment to reduce no-shows.
- **Self-Service Subscription Model:** 14-day Free Trial -> Basic 490 THB/mo -> Pro 990 THB/mo managed via Stripe Single Provider Standard.

---

## 🛠️ Architecture

- **Consumer Web App (`apps/booking-consumer`):** Mobile-first customer booking portal + LINE messaging auto-link binding.
- **Store Owner Dashboard (`apps/booking-admin`):** Admin panel for managing bookings, staff schedules, deposit verification, and billing.
- **Database & Auth (`supabase/`):** Multi-tenant PostgreSQL database with Row-Level Security (RLS), Postgres Range Exclusion Constraints, and custom RPCs.

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
