# 🚀 Project Executive Brief & Session Handoff

> **โปรเจกต์:** Local Service Booking & LINE Automation SaaS  
> **ผู้พัฒนาหลัก:** คุณฟรี (CEO) & Antigravity AI Pair Programmer  
> **สถานะปัจจุบัน:** **Phase A-D เสร็จสมบูรณ์ + Phase E1-E3.3 ทั้งหมดเสร็จสมบูรณ์ ผ่านการ verify จริงผ่าน REST API + browser และ apply บน live DB แล้วทุกจุด** — เหลือแค่ **Phase E4 (Stripe Billing)** ที่ยังไม่เริ่ม — ดูรายละเอียดที่ [`docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md`](docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md), [`docs/technical/PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md`](docs/technical/PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md) และแผนต่อ [`docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md`](docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md)  
> **หมายเหตุ E3.3:** ทำเองคนเดียวโดยไม่มี Codex รีวิว (ผู้ใช้อนุมัติล่วงหน้าคืน 2026-08-08 — ดู vault handoff) เจอบั๊กจริง 2 จุดระหว่าง live verification ของตัวเอง (view `security_invoker` ทำให้ anon อ่านไม่ได้, และ dashboard initial load ไม่โหลด phone/PromptPay/LINE field) แก้และ verify ซ้ำก่อนปิด checkpoint ทั้งคู่
> **Supabase Live Project:** `https://gyleqrjdzwwlqierdwcy.supabase.co` (`local_service` schema)  
> **GitHub Repository:** [`https://github.com/Gutumrod/local-service-booking-saas`](https://github.com/Gutumrod/local-service-booking-saas)

---

## 1. บริบทและวิสัยทัศน์ของโปรเจกต์ (Project Vision & Core Value)

ระบบ **Local Service Booking SaaS** เป็นแพลตฟอร์มรับจองคิวออนไลน์สำหรับร้านค้าบริการในไทย (ร้านตัดผม/บาร์เบอร์, ร้านทำเล็บ/ขนตา, คลินิกเสริมความงาม, คาร์แคร์, สปา/นวด ฯลฯ)
- **Pain Point ที่เราแก้:** ร้านค้าในไทยไม่อยากจ่ายค่าข้อความ LINE Official Account (LINE OA) มหาศาล และไม่อยากได้ระบบจองคิวที่ซับซ้อนยุ่งยาก
- **จุดเด่นของเรา (Core Solution):**
  1. **Hybrid LINE Messaging Model:** ร้านค้าเล็กใช้ **LINE กลางของระบบ (`@central_booking_oa`)** ฟรี ไม่ต้องจ่ายค่าข้อความ LINE เพิ่มเติม! ร้านใหญ่ที่อยากใช้ LINE ร้านตัวเอง สามารถกรอก Channel Access Token ในหลังบ้านเพื่อสลับไปใช้ LINE ร้านค้าได้
  2. **15-Min Slot Lock & Dynamic PromptPay QR Deposit:** ลูกค้าจองคิว ล็อกเวลาไว้ 15 นาที พร้อมสแกน PromptPay QR โอนมัดจำเข้าบัญชีร้านค้าโดยตรง 100% (แพลตฟอร์มไม่หักเปอร์เซ็นต์มัดจำ)
  3. **Multi-Tenant SaaS Model:** สมัครสมาชิกร้านค้าใหม่ฟรี 14 วัน (Free Trial) ปรับเป็น Basic (฿490/ด. คิวจอง 100 คิว) หรือ Pro (฿990/ด. คิวจอง 500 คิว)

---

## 2. โครงสร้าง Monorepo & สถาปัตยกรรมระบบ (App Architecture)

```
D:\AI-Workspace\projects\local-service-booking-saas
├── apps/
│   ├── booking-consumer/       # Next.js 16 (Port 3000) -> หน้าจองคิวฝั่งลูกค้า /book/[slug] + LINE Webhook /api/line/webhook
│   └── booking-admin/          # Next.js 16 (Port 3001) -> หน้าหลังบ้าน /dashboard, /register, /platform-admin, /forgot-password
├── supabase/                   # Migration SQL files (local_service schema)
├── .env.local                  # Single Shared Environment Configuration (Hardlinked to both apps)
├── PRODUCT_RULES_V1.md         # เอกสารกฎการออกแบบและสเปกระบบฉบับสมบูรณ์ (Master Spec)
└── README.md                   # ดัชนีภาพรวมโปรเจกต์
```

---

## 3. สรุปผลงานที่เสร็จสิ้นจริง (ตรวจยืนยันผ่าน REST API จริง ไม่ใช่แค่ execute_sql)

1. ✅ **Supabase PostgreSQL Engine (`local_service` schema) — Phase 1 + Phase A:**
   - Apply migration ทั้งหมดใน `supabase/migrations/` ลงบน Supabase Project `gyleqrjdzwwlqierdwcy` จริง (ระหว่างทางเจอและแก้บั๊ก syntax/trigger-timing/exclusion-constraint ที่ทำให้ apply ไม่ผ่านหรือใช้งานไม่ได้จริงหลายจุด)
   - RPC `create_booking_hold` ล็อกสล็อตเวลา 15 นาที ออกรหัสจอง `BK-XXXXXX` กันคิวชนด้วย Postgres Exclusion Constraint จริง (ทดสอบ race condition ด้วย concurrent request 2 อันแย่ง slot เดียวกันแล้วผ่าน)
   - Seed ข้อมูลร้านค้าตัวอย่าง **Good Cuts Barber** (`slug: good-cuts-barber`) พร้อมบริการ/ช่าง/ตารางงาน/วันหยุด
   - **Phase A hardening:** ปิดช่องโหว่ privileged RPC ที่ anon เรียกได้, ปิด anon direct insert ข้าม RPC, validate slip URL ผูกกับ booking จริง — ดู [`PHASE_A_COMPLETION_REPORT_2026-08-07.md`](docs/technical/PHASE_A_COMPLETION_REPORT_2026-08-07.md)
2. ✅ **Single Shared Environment Configuration (`.env.local`):**
   - สร้างไฟล์ `.env.local` ตัวหลักที่ root directory และทำ Hardlink เชื่อมตรงไปยังทั้ง 2 apps
   - รองรับการตั้งค่า `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_CENTRAL_LINE_OA_ID`, `LINE_CHANNEL_SECRET` และ `LINE_CHANNEL_ACCESS_TOKEN` ในจุดเดียว
3. ✅ **LINE OA Webhook Gateway (`/api/line/webhook`) — Phase B เสร็จแล้ว ใช้งานได้จริง:**
   - HMAC-SHA256 signature verification ด้วย `crypto.timingSafeEqual` (กัน timing attack), parse คำสั่ง `ผูกคิว {booking_code}-{link_token}` ครบ
   - เปลี่ยนมาใช้ `apps/booking-consumer/src/lib/supabase-admin.ts` (service_role client, server-only, ไม่หลุดไป client-side) แทน anon key ที่โดน RLS บล็อกเงียบๆ ของเดิม
   - Audit log (`line_notification_logs`) ใช้ lifecycle `pending → sent/failed` กันเคสที่ LINE ส่งสำเร็จแต่บันทึกผลไม่สำเร็จแล้วโดนตีเป็น "failed" เท็จ
   - Verify จริงด้วย signed webhook POST ต่อ dev server (ไม่ใช่แค่อ่านโค้ด) — ดูรายละเอียดที่ [`2026-08-07-phase-b-checkpoint-gotchas.md`](file:///D:/AI-Workspace/vault/06-Agent-Logs/Local-Service-Booking-SaaS/2026-08-07-phase-b-checkpoint-gotchas.md) ใน vault (local path, git-synced แยกจาก repo นี้)
4. ✅ **เชื่อมต่อ Frontend เข้ากับ Backend + Phase C fail-closed/no-deposit fixes:**
   - หน้า `/book/[slug]` ฝั่งลูกค้า **เชื่อมและทดสอบ end-to-end จริงแล้ว** (จอง → ล็อกสล็อต → อัปโหลดสลิปเข้า Supabase Storage จริง → ยืนยัน)
   - **Phase C:** บริการไม่มีมัดจำ (`status=confirmed, deposit_status=not_required`) ข้ามหน้าอัปโหลดสลิปไปหน้ายืนยันคิวทันที ไม่บังคับ QR/สลิปอีกต่อไป
   - **Phase C:** พนักงานที่ไม่มีแถว `staff_schedules` ของวันนั้นถือว่า **ไม่ว่าง** (fail-closed) ทั้ง RPC `create_booking_hold` และ frontend availability check — เดิมเป็น fail-open (ถือว่าว่างเสมอ) เป็นบั๊กที่แก้แล้ว บันทึกกฎไว้ใน [`PRODUCT_RULES_V1.md`](PRODUCT_RULES_V1.md) ข้อ 3.5
5. ✅ **หน้า `/dashboard` ฝั่งร้านค้า — Phase E1-E3.2 เชื่อม backend จริงแล้ว (ยกเว้น settings/billing ที่ยังรอ E3.3-E4):**
   - **E1 — Owner Auth:** Supabase Auth email/password จริง, `/login`, `/auth/callback` (รองรับทั้ง PKCE และ email OTP confirm), dashboard guard เช็ค session + `shop_users` membership จริงฝั่ง server, logout — `/register` สร้างบัญชี Auth จริง + เรียก RPC `provision_owner_shop` (atomic, idempotency-keyed, กัน 1 account เป็นเจ้าของได้แค่ 1 ร้าน)
   - **E2 — Bookings Tab:** ลบ `INITIAL_BOOKINGS` mock, โหลดคิวจริงตาม shop ของผู้ใช้ที่ login, approve/reject/cancel ผ่าน RPC ที่เช็ค `is_shop_member` + row lock (`FOR UPDATE`) ทั้งหมด ไม่ใช่ raw `.update()` เหมือนเดิม — ยกเลิกบังคับระบุเหตุผลจริง ไม่ auto-mark มัดจำเป็น refunded (ร้านต้องคืนเงินเองแล้วบันทึกย้อนหลังตาม V1 ข้อ 4.4)
   - **E3.1 — Services & Staff:** เพิ่ม `has_shop_role()`/`is_shop_owner()`, RPC จัดการบริการ (owner/admin) และพนักงาน (owner เท่านั้น) ตรงตาม role matrix ใน V1 ข้อ 7, soft-disable ผ่าน `is_active` (services มี booking FK แบบ `ON DELETE RESTRICT` ลบจริงไม่ได้)
   - **E3.2 — Schedules & Holidays:** RPC บันทึกตารางพนักงาน 7 วันแบบ atomic (ตรวจวันซ้ำ/เวลา/break) + RPC จัดการวันหยุดร้าน (idempotency-keyed) — owner/admin แก้ได้, staff อ่านอย่างเดียว (ยังไม่มี column เชื่อม `auth user` กับ `staff.id` จึงพิสูจน์ "ตัวเอง" ของ staff ไม่ได้ — deferred)
   - **ทุก checkpoint ปิดช่องโหว่เดียวกัน:** table เดิมมี `GRANT ALL`/policy `FOR ALL USING (is_shop_member(...))` ที่ไม่แยก role เลย แปลว่า **staff ธรรมดาเขียนตรงเข้าตารางได้มาตลอด** ก่อนหน้านี้ — ทุก RPC ใหม่ revoke direct write จาก `authenticated` แล้วบังคับผ่าน RPC ที่เช็ค role จริง
   - **E3.3 — Shop Settings:** เสร็จแล้ว — พบและปิดช่องโหว่: `shops` table เปิดให้ anon `select *` ได้ทุกคอลัมน์รวม `subscription_status`, `trial_ends_at`, `owner_name` (ยืนยันจริงผ่าน REST) แก้ด้วย view `shop_public_profile` (คอลัมน์จำกัดเฉพาะที่หน้าจองใช้จริง) + RPC `update_shop_settings` (owner เท่านั้น ตาม V1 ข้อ 7) ตัด Custom LINE Channel Token input ออกจาก client ทั้งหมด (ไม่เคยเชื่อม backend เลย ถอดก่อนจะกลายเป็น client secret risk)
   - **E4 (Billing/Stripe) ยังไม่เริ่ม** — เป็นงานสุดท้ายที่เหลือใน Phase E

---

### 📌 เอกสารอ้างอิงสำคัญในโปรเจกต์
- 🏠 **Project README:** [`README.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/README.md)
- 📄 **Master Spec & Rules:** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)
- 🛠️ **แผนงาน Phase A-E:** [`docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md)

## 3.2 หน้าหลังบ้านร้านค้า (`apps/booking-admin/src/app/dashboard/page.tsx`) — เชื่อม backend จริงแล้ว 5/6 แท็บ

- สถานะ 6 แท็บ (อัปเดต 2026-08-08 หลัง E3.3):
  1. `bookings` ✅ **จริง (E2):** โหลดคิวจริงตาม shop ของผู้ login, approve/reject/cancel ผ่าน RPC, loading/error/empty state, ป้องกันกดซ้ำระหว่าง mutation
  2. `staff` ✅ **จริง (E3.1):** เพิ่ม/เปิด-ปิดพนักงานผ่าน RPC (owner เท่านั้น), soft-disable ไม่ลบจริง
  3. `services` ✅ **จริง (E3.1):** เพิ่ม/แก้/ปิดบริการผ่าน RPC (owner/admin), soft-disable ผ่าน `is_active`
  4. `schedules` ✅ **จริง (E3.2):** ตารางพนักงาน 7 วัน + วันหยุดร้าน โหลด/บันทึกจริงผ่าน RPC แบบ atomic (owner/admin), ตัด state "เวลาเปิดร้านรวม" ที่ไม่มี backend column ออกแล้ว
  5. `settings` ✅ **จริง (E3.3):** ชื่อร้าน/เบอร์/ที่อยู่/PromptPay/LINE OA ID บันทึกผ่าน RPC `update_shop_settings` (owner เท่านั้น) — ตัด Channel Token input และปุ่มทดสอบส่ง LINE (mock) ออกหมดแล้ว
  6. `billing` ⬜ **ยัง mock — รอ E4:** ดูโควตาคิวจอง ประวัติแพ็กเกจ และปุ่มอัปเกรดผูกลิงก์ไปหน้า `/register` (ยังไม่เชื่อม Stripe)

### 🟢 3.3 หน้าสมัครสมาชิกร้านค้าใหม่ (`apps/booking-admin/src/app/register/page.tsx`)
- **4-Step Onboarding Wizard:** ข้อมูลร้านค้า ➔ เลือกแพ็กเกจ (ผูก query string `?plan=...`) ➔ ตั้งค่า PromptPay ➔ สำเร็จ
- **Free-text Business Category:** กรอกหมวดหมู่อิสระ พร้อมปุ่ม Quick Suggestion Chips 8 ประเภท
- **Editable URL Slug Input:** มีช่องกรอก URL สลักร้านค้าภาษาอังกฤษ พร้อมข้อความกำกับกระชับ: `💡 หมายเหตุ: URL ใช้ภาษาอังกฤษเพื่อป้องกันการแปลงภาษาผิด` (แก้ปัญหาร้านค้าชื่อไทยโดนลบหลุดเป็น `my-shop`)

### 🟢 3.4 หน้าศูนย์ควบคุม CEO คุณฟรี (`apps/booking-admin/src/app/platform-admin/page.tsx`)
- **Pending Shop Approval Queue:** การ์ดสีส้มเตือนเมื่อมีร้านใหม่สมัครเข้ามา มีปุ่ม `อนุมัติเปิดใช้งาน` / `ปฏิเสธ` / `โทรหาเจ้าของร้าน`
- **Status Filter Tabs:** ซ่อนร้านค้าที่ยกเลิก/ระงับบริการโดยอัตโนมัติ มีแท็บสลับดู `Active`, `Pending`, `Cancelled`, `All`
- **Expiration Date Column:** คอลัมน์วันหมดอายุ/ตัดรอบบิลถัดไป พร้อมปุ่มกดขยายเวลา **`+14 วัน`** สำหรับคุณฟรี
- **Impersonation Button:** ปุ่มทางลัด **`👁️ ดูหลังบ้าน`** แอบวาร์ปเข้าแดชบอร์ดหลังบ้านของร้านค้า

### 🟢 3.5 หน้ากู้คืนรหัสผ่านร้านค้า (`apps/booking-admin/src/app/forgot-password/page.tsx`)
- แบบฟอร์มกู้คืนรหัสผ่านสำหรับร้านค้าที่ลืมรหัสผ่าน สำหรับส่งอีเมลรีเซ็ตใน Phase 1

---

## 4. ผลการตรวจวิเคราะห์คุณภาพ (Independent Audit Passed)

โปรเจกต์ผ่านการสแกนตรวจโค้ดจาก **Independent Quality Auditor Subagent** แบบ 100% Honest & Zero Flattery และผ่านการแก้ไขบั๊กวิกฤตครบถ้วนทั้ง 3 จุด:
1. ✅ **แก้บั๊ก Slug ร้านภาษาไทยใน `/register`:** ใช้ unique slug `shop-XXX` + editable input พร้อมข้อความหมายเหตุภาษาอังกฤษ
2. ✅ **แก้บั๊กสล็อตเวลา 15 นาทีใน `/book/[slug]`:** ล็อกฟอร์มเมื่อหมดเวลา มีแถบสีแดงเตือน + ปุ่มเลือกเวลาใหม่
3. ✅ **แก้ปุ่มดาวน์โหลดรูป QR มัดจำ:** โหลดไฟล์ `.png` ยอดมัดจำลงเครื่องจริง

---

## 5. แผนการดำเนินงานต่อ (Roadmap & Next Steps)

Phase A-D เสร็จแล้ว, Phase E แตกเป็น checkpoint ย่อย (E1, E2, E3.1-E3.3, E4) ตาม [`docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md`](docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md) — **ห้ามข้ามลำดับ** แต่ละ checkpoint ต้อง verify ผ่าน REST API จริง (+ browser สำหรับ UI) ก่อนเริ่ม checkpoint ถัดไป:

- ✅ **Phase B:** แก้ LINE webhook ให้ใช้ `SUPABASE_SERVICE_ROLE_KEY` ผ่าน server-only admin client — commit `370473f`
- ✅ **Phase C:** แก้ frontend no-deposit flow + fail-closed staff schedule — commit `c8a00e3`
- ✅ **Phase D:** เอกสารขั้นตอน manual "Exposed schemas" กันเจอ `406 PGRST106` ซ้ำตอน deploy ใหม่
- ✅ **Phase E1:** Owner auth (Supabase Auth email/password + atomic shop provisioning RPC) — commit `a42ec09`
- ✅ **Phase E2:** Bookings tab เชื่อมจริง + approve/reject/cancel RPC — commit `38058a6`
- ✅ **Phase E3.1:** Services & Staff management RPC + role authorization — commit `bd761fe`
- ✅ **Phase E3.2:** Schedules & Holidays RPC + role authorization — commit `8bd6a45`
- ✅ **Phase E3.3:** Shop Settings จริง + ตัด LINE Channel Token ออกจาก client + ปิดช่องโหว่ `shops` table เปิด column ภายในให้ anon อ่านได้ — ดู [`PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md`](docs/technical/PHASE_E3_3_COMPLETION_REPORT_2026-08-08.md)
- ⬜ **Phase E4:** เชื่อม Stripe Billing/Checkout/Portal จริง (ยังไม่เริ่ม — งานสุดท้ายของ Phase E)

เมื่อเปิดแชทใหม่ ให้บอก AI Agent ในแชทใหม่ดังนี้:

```text
"สวัสดีครับ ผมต้องการลุยโปรเจกต์ Local Service Booking SaaS ต่อ
โปรดอ่านไฟล์ PRODUCT_RULES_V1.md, PROJECT_HANDOVER_BRIEF.md,
docs/technical/BRIEF_PHASE2_HARDENING_A_TO_E.md ในคลังไฟล์

Phase A-D และ E1-E3.3 เสร็จแล้ว ต่อ Phase E4 (เชื่อม Stripe Billing/Checkout/
Portal จริง — dashboard billing tab ยังเป็น mock ทั้งหมด) ตามบรีฟ Phase A-E"
```

## 6. ⚠️ ขั้นตอน Manual ที่ทำอัตโนมัติไม่ได้ (ต้องทำเองทุกครั้งที่ deploy โปรเจกต์ใหม่)

หลัง apply migration ทั้งหมดใน `supabase/migrations/` ลง Supabase project ใหม่แล้ว **ต้องเข้า Dashboard ไปเพิ่ม `local_service` ใน Exposed schemas เอง** ที่ Project Settings → API → Data API → Exposed schemas

ขั้นตอนนี้ทำผ่าน SQL, Supabase Management API, หรือ MCP tool ใดๆ **ไม่ได้** ต้องกดผ่านหน้า Dashboard เท่านั้น ถ้าข้ามขั้นตอนนี้ไป ทุก request ที่ยิงเข้าตาราง/RPC ใน schema `local_service` จะได้ error `406 PGRST106: Invalid schema` แม้ migration และ RLS grants จะถูกต้องครบทุกอย่างแล้วก็ตาม — เคยเกิดขึ้นจริงกับโปรเจกต์นี้มาแล้วครั้งหนึ่ง (2026-08-07) กว่าจะวินิจฉัยเจอ

### ⚠️ Auth Redirect URLs (เพิ่มใหม่จาก Phase E1 — ต้องอัปเดตอีกครั้งตอน deploy จริง)

`/register` และ `/login` ของ `booking-admin` ใช้ Supabase Auth email/password + email confirmation จริง ซึ่งต้องเพิ่ม URL ไว้ล่วงหน้าที่ Dashboard → Authentication → URL Configuration:

- **ตอนนี้ (dev, ใส่ไว้แล้ว 2026-08-07):** Site URL = `http://localhost:3001`, Redirect URLs = `http://localhost:3001/auth/callback` (+ `http://localhost:3001/**`)
- **ตอน deploy ขึ้นโดเมนจริง (ยังไม่ทำ):** ต้องกลับมาเพิ่ม `https://<โดเมนจริง>/auth/callback` (และปรับ Site URL) ที่หน้าเดียวกัน — ถ้าลืม ลิงก์ยืนยันอีเมลที่ส่งจาก production จะ redirect ไม่ได้ (เข้าทำนองเดียวกับ Exposed Schemas ข้างบน คือทำผ่าน SQL/MCP ไม่ได้ ต้องกด Dashboard เอง)

---

### 📌 เอกสารอ้างอิงสำคัญในโปรเจกต์
- 📄 **Master Spec & Rules:** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)
- 🏠 **Project README:** [`README.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/README.md)
