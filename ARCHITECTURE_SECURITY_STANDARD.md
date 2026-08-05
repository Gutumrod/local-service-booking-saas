# 🛡️ ธรรมนูญสถาปัตยกรรม & มาตรฐานความปลอดภัย (Architecture & Security Standard Governance)
## "Local Service Booking & LINE Automation SaaS"

> **บังคับใช้โดย:** คุณฟรี (CEO) & Antigravity Agent (AGY)  
> **วันที่มีผล:** 2026-08-05  
> **วัตถุประสงค์:** ล็อกข้อกำหนดทางเทคโนโลยี มาตรฐานความปลอดภัย และกฎเหล็กการพัฒนา เพื่อบังคับให้โปรเจกต์เดินหน้าไปในทิศทางที่เสถียร ปลอดภัย และสร้างรายได้ได้จริงโดยไม่หลุดกรอบ

---

## 📌 1. กฎเหล็กเทคโนโลยี (Tech Stack Governance Rules)

```text
Language: TypeScript (Strict Mode) ➔ Mandatory 0 Compile Error
Frontend: Next.js App Router + Tailwind CSS
Database: Supabase PostgreSQL (Open-Source Free Tier) + RLS Policy
Monorepo: apps/booking-consumer (Port 3000) | apps/booking-admin (Port 3001)
```

1. **TypeScript Strict Mode เท่านั้น:** ห้ามเขียน Plain JavaScript หรือใช้ `any` Type โดยไม่จำเป็น โค้ดทุกบรรทัดต้องผ่านการตรวจสอบ Type Strictness ก่อนปล่อยงาน
2. **Monorepo App Isolation:** แอปจองคิวฝั่งลูกค้า (`apps/booking-consumer`) และหลังบ้านเจ้าของร้าน (`apps/booking-admin`) ต้องถูกแยก Codebase และ Runtime ออกจากกันเด็ดขาด หากฝั่งหนึ่งมีปัญหา อีกฝั่งต้องทำงานต่อได้ 100%
3. **Database Engine:** ใช้ Supabase PostgreSQL ภายใต้ Schema `local_service` เท่านั้น ห้ามใช้ Local In-Memory Storage แทนฐานข้อมูลจริงในโหมด Production

---

## 🔒 2. กฎเหล็กระบบรักษาความปลอดภัย (Security & Credential Protection Standards)

### 2.1 Zero Client-Side Secret Leakage (ห้ามเปิดเผยรหัสลับบนหน้าเว็บเด็ดขาด)
- **กฎเหล็ก:** รหัสลับ `Channel Access Token`, `Channel Secret`, หรือ `Service Role Key` **ห้ามปรากฏเป็นตัวหนังสือบน Client DOM / Web Form หน้าเว็บเด็ดขาด**
- **มาตรฐานการเก็บ:** รหัสลับต้องจัดเก็บใน **Server-Side Environment Variables (`.env.local`)** หรือ **Supabase Vault** ฝั่ง Server เท่านั้น หน้าเว็บเบราว์เซอร์จะเห็นเพียงสถานะการเชื่อมต่อ (`Protected Status`)

### 2.2 Row Level Security (RLS) Mandatory Policy (กั้นข้อมูลข้ามร้านค้า 100%)
- ทุกตารางในฐานข้อมูล PostgreSQL ต้องถูกเปิดใช้งาน **Row Level Security (RLS)**
- ทุกคำสั่ง Query ฝั่ง Admin ต้องถูกตรวจสอบสิทธิ์ผ่าน `local_service.is_shop_member(shop_id)` เพื่อการันตีว่าข้อมูลร้าน A ไม่มีวันรั่วไหลไปร้าน B 100%

### 2.3 Form Input Sanitization (ดักจับขยะก่อนเข้าดีบี)
- ข้อมูลที่รับจากลูกค้าและเจ้าของร้านทุกจุด ต้องผ่านการตรวจสอบความถูกต้องด้วย **Zod Schema Validation** ก่อนส่งข้าม Network

---

## ⚡ 3. กฎเหล็กป้องกันระบบรวน & การตรวจสลิปมัดจำ (Anti-Crash & Anti-Fraud Standards)

### 3.1 Atomic Double-Booking Protection (ป้องกันการจองคิวซ้ำซ้อน)
- การจองคิวต้องใช้ **PostgreSQL Atomic Transaction Constraint / RPC Function**
- หากมีผู้ใช้ 2 คนพยายามกดจองรอบเวลาเดียวกันในมิลลิวินาทีเดียวกัน ฐานข้อมูลจะอนุมัติคิวแรก และปฏิเสธคิวที่สองด้วย `409 Booking Conflict` ทันที ป้องกันปัญหาจองซ้อน 100%

### 3.2 Anti-Fake Slip Verification Engine (ป้องกันสลิปมัดจำปลอม)
- สลิปมัดจำที่ลูกค้าแนบเข้ามา ต้องผ่านการตรวจสอบ QR Code Payload บนสลิป หรือต่อ API ตรวจสลิป (SlipOK API) เพื่อเช็คยอดโอนจริงและเลขอ้างอิงธนาคารซ้ำซ้อน ก่อนเปลี่ยนสถานะเป็น `confirmed`

---

## 📋 4. กฎเหล็กการตรวจรับงาน (Definition of Done & Verification Rules)

ทุกๆ Checkpoint หรือฟีเจอร์ใหม่ที่จะนับว่า "ทำเสร็จแล้ว" จะต้องผ่านเกณฑ์ 3 ข้อนี้เสมอ:

1. **Zero Compilation Error:** รันคำสั่ง `npm run build` ผ่าน 100% ทั้งใน `apps/booking-consumer` และ `apps/booking-admin`
2. **Git Version Control Checkpoint:** มีการ Commit โค้ดและ Push ขึ้น GitHub Repository Official (`https://github.com/Gutumrod/local-service-booking-saas`) พร้อมอัปเดตไฟล์ `CHECKPOINT_VX.md`
3. **Vault Syncing:** บันทึกประวัติและบริบทการพัฒนาลงในคลังความทรงจำถาวร **AGY-Vault** (`01_Projects/local_service_booking_saas.md`)
