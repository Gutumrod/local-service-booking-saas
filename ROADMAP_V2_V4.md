# 🗺️ ROADMAP & CHECKPOINTS (V2 ➔ V4)
## "Local Service Booking & LINE Automation SaaS"

> **อนุมัติโดย:** คุณฟรี (CEO)  
> **วันที่มีผล:** 2026-08-05

---

## 📌 สรุปแผนการพัฒนาและเช็คพอยต์ (Master Roadmap)

| Checkpoint | ฟีเจอร์หลัก (Core Deliverables) | สถานะ |
| :--- | :--- | :--- |
| **V1 (Completed)** | Monorepo Setup, Supabase Schema Initial, 3-Step Customer Booking, Store Dashboard & 14-Day Free Trial Banner | 🟢 Completed |
| **V2 (Current Target)** | **ระบบตารางช่าง & วันหยุดร้านแบบจัดเต็ม:** เวลาทำงาน, เวลาพักเที่ยง, วันหยุดประจำสัปดาห์, วันหยุดพิเศษรายวัน + Slot Calculator Engine | 🟡 In Progress |
| **V3** | **ระบบแจ้งเตือน LINE OA & Flex Message:** การ์ดใบจองคิวสวยงามส่งเข้า LINE ลูกค้า + การ์ดเตือนคิวใหม่ให้ร้าน + แจ้งเตือนล่วงหน้า 1 ชั่วโมง | ⚪ Pending |
| **V4** | **ระบบตรวจสลิปมัดจำอัตโนมัติ 100%:** ต่อ Slip Verification API อนุมัติคิวทันทีโดยไม่ต้องกดมือ + Auto Subscription Billing | ⚪ Pending |

---

## 🛠️ รายละเอียดสเปก Checkpoint V2 (Staff Schedule & Slot Blocking)

### 1. Store Owner Dashboard (หน้าตั้งค่าหลังบ้าน)
- **Staff Shift & Working Hours:** กำหนดเวลาเริ่ม-เลิกงานของช่างแต่ละคน (เช่น 10:00 - 19:00 น.)
- **Break Time Management:** กำหนดเวลาพักเที่ยง/พักระหว่างวัน (เช่น 12:00 - 13:00 น.) ระบบจะซ่อนคิวช่วงเวลานั้นอัตโนมัติ
- **Weekly Days Off:** เลือกวันหยุดประจำสัปดาห์ของช่าง (เช่น หยุดทุกวันจันทร์)
- **Special Holiday Dates:** กำหนดวันหยุดพิเศษรายวัน (เช่น หยุดวันแม่ 12 ส.ค.)

### 2. Customer Booking Engine (คำนวณคิวฝั่งลูกค้า)
- คำนวณรอบเวลาว่าง (Available Time Slots) อัตโนมัติ โดยตัด:
  - รอบเวลาที่คิวเต็มแล้ว
  - รอบเวลาตรงกับช่วงพักเที่ยงของช่าง
  - รอบเวลาที่ตรงกับวันหยุดประจำสัปดาห์หรือวันหยุดพิเศษ
