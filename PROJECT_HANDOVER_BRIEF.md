# 🚀 Project Executive Brief & Session Handoff (สำหรับเริ่มแชทใหม่)

> **โปรเจกต์:** Local Service Booking & LINE Automation SaaS  
> **ผู้พัฒนาหลัก:** คุณฟรี (CEO) & Antigravity AI Pair Programmer  
> **สถานะปัจจุบัน:** Phase 0 (UI/UX Frontend Prototype 100% Lock) ➔ **พร้อมเริ่ม Phase 1 Backend Immediately**  
> **GitHub Repository:** [`https://github.com/Gutumrod/local-service-booking-saas`](https://github.com/Gutumrod/local-service-booking-saas) (Latest Commit: `0cc1e88`)

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
│   ├── booking-consumer/       # Next.js 16 (Port 3000) -> หน้าจองคิวฝั่งลูกค้า /book/[slug]
│   └── booking-admin/          # Next.js 16 (Port 3001) -> หน้าหลังบ้าน /dashboard, /register, /platform-admin, /forgot-password
├── docs/                       # เอกสารสเปกทางเทคนิค การเงิน และสถาปัตยกรรมระบบ
│   ├── technical/
│   └── business/
├── PRODUCT_RULES_V1.md         # เอกสารกฎการออกแบบและสเปกระบบฉบับสมบูรณ์ (Master Spec)
└── README.md                   # ดัชนีภาพรวมโปรเจกต์
```

---

## 3. สรุปความพร้อมของ 4 หน้าหลักที่ล็อกดีไซน์สมบูรณ์ 100%

### 🟢 3.1 หน้าจองฝั่งลูกค้า (`apps/booking-consumer/src/app/book/[slug]/page.tsx`)
- **Step 1 (เลือกบริการ/ช่าง):** แสดงรายการบริการ ระยะเวลา ราคา ยอดมัดจำ และเลือกพนักงาน
- **Step 2 (เลือกรอบเวลา):** เลือกระบุวันที่ นัดหมายเวลา ล็อกสล็อต 15 นาที
- **Step 3 (มัดจำ PromptPay & ยืนยัน):**
  - แสดง **PromptPay Dynamic QR Code** (ดึงจาก `promptpay.io`) พร้อมปุ่มกด **`บันทึกรูป QR Code`** ดาวน์โหลดไฟล์ภาพ `.png` ลงเครื่องจริง 100%
  - **15-Min Expired Timer:** นับเวลาถอยหลัง 15 นาที หากหมดอายุ (`00:00`) จะแสดงแถบสีแดงแจ้งเตือน ปิดใช้งานปุ่มยืนยันจอง และมีปุ่ม **`🔄 เลือกรอบเวลาใหม่`** ให้กดเริ่มเลือกเวลาใหม่ใน 1 คลิก

### 🟢 3.2 หน้าหลังบ้านร้านค้า (`apps/booking-admin/src/app/dashboard/page.tsx`)
- **6 แท็บการทำงาน:**
  1. `bookings`: ตารางคิวงาน ฟอนต์ใหญ่ อ่านง่าย มีปุ่ม `ยกเลิกคิว` และป๊อบอัพตรวจสลิปมัดจำมีปุ่ม X/ปิดหน้าต่าง
  2. `schedules`: จัดการเวลาเปิด-ปิด ตารางเวลาพนักงานแบบ 3 คอลัมน์จัตุรัส และฟอร์มวันหยุดพิเศษแบบ Split View
  3. `staff`: เพิ่ม/ลบพนักงาน ปรับสถานะการทำงาน
  4. `services`: เพิ่ม/แก้ไขบริการ ราคา ยอดมัดจำ ระยะเวลา
  5. `settings`: ตั้งค่า PromptPay, โลโก้ร้าน, และเลือกสลับ **LINE กลางของระบบ (@central_booking_oa)** หรือ LINE ร้านค้า
  6. `billing`: ดูโควตาคิวจอง ประวัติแพ็กเกจ และปุ่มอัปเกรดผูกลิงก์ไปหน้า `/register`

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

## 5. แผนการดำเนินงานต่อใน Phase 1 (Roadmap & Next Steps)

เมื่อเปิดแชทใหม่ ให้บอก AI Agent ในแชทใหม่ดังนี้:

```text
"สวัสดีครับ ผมต้องการลุยโปรเจกต์ Local Service Booking SaaS ต่อใน Phase 1 Backend Integration 
โปรดอ่านไฟล์ PRODUCT_RULES_V1.md และ PROJECT_HANDOVER_BRIEF.md ในคลังไฟล์ 

ภารกิจของเราใน Phase 1 คือ:
1. ออกแบบและต่อสายไฟฐานข้อมูล Supabase PostgreSQL (ตาราง shops, bookings, services, staff, schedules)
2. สร้าง LINE OA Webhook Gateway (/api/line/webhook) สำหรับยิง Flex Card แจ้งเตือนเข้า LINE จริง"
```

---

### 📌 เอกสารอ้างอิงสำคัญในโปรเจกต์
- 📄 **Master Spec & Rules:** [`PRODUCT_RULES_V1.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/PRODUCT_RULES_V1.md)
- 🏠 **Project README:** [`README.md`](file:///D:/AI-Workspace/projects/local-service-booking-saas/README.md)
