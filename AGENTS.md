# 🚨 AGENTS & AI OPERATING RULES (LOCAL SERVICE BOOKING SAAS)

## ⚠️ STRICT RULE #0: MANDATORY USER CONFIRMATION BEFORE EXECUTION (กฎเหล็กห้ามลัดขั้นตอน)

1. **คำว่า "ถามก่อน" หรือการสอบถามสถานะ = ห้ามแตะโค้ดเด็ดขาด:**  
   หากคุณฟรีส่งข้อความในลักษณะถามคำถาม, สอบถามสถานะระบบ, หรือมีคำว่า *"ถามก่อน"*, *"ถามไว้ก่อน"*, *"ถามเฉยๆ"* **เอเจนต์ห้ามทำการแก้ไขโค้ด สร้างไฟล์ รันคำสั่ง หรือดัดแปลงไฟล์ระบบโดยเด็ดขาด!**
2. **ต้องตอบคำถามให้ชัดเจนก่อนเสมอ:**  
   เอเจนต์ต้องอธิบาย ตอบคำถาม ให้ข้อมูล หรือเสนอทางเลือกให้คุณฟรีก่อนเท่านั้น
3. **ต้องได้รับการคอนเฟิร์มเป็นลายลักษณ์อักษรจากคุณฟรีก่อนลงมือทำ:**  
   ห้ามคิดทายเอาเอง ห้ามตื่นตระหนกรีบไปแก้โค้ด ต้องรอคำสั่งอนุมัติ/คอนเฟิร์มจากคุณฟรีให้ชัดเจนก่อนแตะไฟล์ทุกครั้ง

---

## 📌 PROJECT STACK & ARCHITECTURE RULES

- **TypeScript Strict Mode:** Mandatory 0 compile errors (`npm run build`).
- **Monorepo App Isolation:** `apps/booking-consumer` (Port 3000) & `apps/booking-admin` (Port 3001).
- **Zero Client Secrets:** `Channel Access Token`, `Channel Secret`, and `Service Role Key` MUST NEVER be exposed in client React components or plain HTML inputs.
- **Database Engine:** Supabase PostgreSQL with Row Level Security (RLS) under `local_service` schema.
- **Stripe Single Gateway Standard:** Stripe is the sole provider for subscriptions (Stripe Checkout / Billing / Customer Portal).
