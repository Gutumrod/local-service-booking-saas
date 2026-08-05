# 🚀 Local Service Booking & LINE Automation SaaS

> **GitHub Repository:** [https://github.com/Gutumrod/local-service-booking-saas](https://github.com/Gutumrod/local-service-booking-saas)

Multi-tenant Booking, Deposit & LINE Automation SaaS designed for Local Service Businesses (Barbershops, Salons, Clinics, Spas, Auto Detailing, etc.) built for solopreneur speed, high automation, and 100% self-service subscription model.

## 🌟 Key Features

- **Self-Service Onboarding:** Shop owners sign up, choose their custom subdomain/slug URL, and go live instantly.
- **Service & Staff Management:** Flexible service items, pricing, duration, and staff/bay assignment.
- **PromptPay QR Deposit:** Require fixed or percentage booking deposits to eliminate No-Shows.
- **Automated LINE OA Notifications:** Instant booking confirmations, status updates, and reminder messages sent to customers via LINE.
- **14-Day Free Trial & Subscription:** Self-service billing tier management (Basic 490 THB/mo, Pro 990 THB/mo).

## 🛠️ Architecture

- **Consumer Web App (`apps/booking-consumer`):** Mobile-first customer booking portal + LINE Login integration.
- **Store Owner Dashboard (`apps/booking-admin`):** Admin panel for managing bookings, staff schedules, deposit verification, and billing.
- **Database & Auth (`supabase/`):** Multi-tenant PostgreSQL database with Row-Level Security (RLS), custom RPCs, and real-time triggers.

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
