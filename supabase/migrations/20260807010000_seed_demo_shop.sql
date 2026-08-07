-- Seed Demo Shop: Good Cuts Barber
-- Date: 2026-08-07

INSERT INTO local_service.shops (
    name,
    slug,
    phone,
    address,
    line_oa_id,
    promptpay_number,
    promptpay_name,
    require_deposit,
    default_deposit_amount,
    subscription_status,
    is_active
)
VALUES (
    'Good Cuts Barber',
    'good-cuts-barber',
    '081-234-5678',
    'สุขุมวิท กรุงเทพฯ',
    'central_booking_oa',
    '0812345678',
    'Good Cuts Barber',
    true,
    100.00,
    'trial',
    true
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    line_oa_id = EXCLUDED.line_oa_id,
    promptpay_number = EXCLUDED.promptpay_number,
    promptpay_name = EXCLUDED.promptpay_name,
    require_deposit = EXCLUDED.require_deposit,
    default_deposit_amount = EXCLUDED.default_deposit_amount,
    subscription_status = EXCLUDED.subscription_status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

WITH demo_shop AS (
    SELECT id
    FROM local_service.shops
    WHERE slug = 'good-cuts-barber'
), service_seed (name, description, duration_minutes, price, deposit_amount) AS (
    VALUES
        ('ตัดผมชาย', 'ตัดผมชาย จัดทรงตามสไตล์ที่ต้องการ', 45, 350.00, 100.00),
        ('สระ+ไดร์', 'สระผมและไดร์จัดทรงให้เรียบร้อย', 20, 150.00, 50.00),
        ('ทำสีผม', 'ทำสีผมพร้อมให้คำแนะนำเฉดสีที่เหมาะกับคุณ', 120, 1200.00, 300.00),
        ('โกนหนวด', 'โกนและเก็บรายละเอียดหนวดอย่างพิถีพิถัน', 15, 120.00, 0.00)
)
INSERT INTO local_service.services (
    shop_id,
    name,
    description,
    duration_minutes,
    price,
    deposit_amount,
    is_active
)
SELECT
    demo_shop.id,
    service_seed.name,
    service_seed.description,
    service_seed.duration_minutes,
    service_seed.price,
    service_seed.deposit_amount,
    true
FROM demo_shop
CROSS JOIN service_seed
WHERE NOT EXISTS (
    SELECT 1
    FROM local_service.services
    WHERE services.shop_id = demo_shop.id
      AND services.name = service_seed.name
);

WITH demo_shop AS (
    SELECT id
    FROM local_service.shops
    WHERE slug = 'good-cuts-barber'
), staff_seed (name, nickname, phone) AS (
    VALUES
        ('ช่างเอก', 'เอก', '081-111-1111'),
        ('ช่างตั้ม', 'ตั้ม', '082-222-2222'),
        ('ช่างบิว', 'บิว', '083-333-3333')
)
INSERT INTO local_service.staff (
    shop_id,
    name,
    nickname,
    phone,
    is_active
)
SELECT
    demo_shop.id,
    staff_seed.name,
    staff_seed.nickname,
    staff_seed.phone,
    true
FROM demo_shop
CROSS JOIN staff_seed
WHERE NOT EXISTS (
    SELECT 1
    FROM local_service.staff
    WHERE staff.shop_id = demo_shop.id
      AND staff.name = staff_seed.name
);

WITH demo_shop AS (
    SELECT id
    FROM local_service.shops
    WHERE slug = 'good-cuts-barber'
), staff_days (staff_id, shop_id, staff_name, day_of_week) AS (
    SELECT staff.id, demo_shop.id, staff.name, days.day_of_week
    FROM demo_shop
    JOIN local_service.staff ON staff.shop_id = demo_shop.id
    CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS days(day_of_week)
    WHERE staff.name IN ('ช่างเอก', 'ช่างตั้ม', 'ช่างบิว')
)
INSERT INTO local_service.staff_schedules (
    shop_id,
    staff_id,
    day_of_week,
    is_working_day,
    work_start,
    work_end,
    break_start,
    break_end
)
SELECT
    staff_days.shop_id,
    staff_days.staff_id,
    staff_days.day_of_week,
    NOT (
        (staff_days.staff_name = 'ช่างเอก' AND staff_days.day_of_week = 0)
        OR (staff_days.staff_name = 'ช่างตั้ม' AND staff_days.day_of_week = 1)
        OR (staff_days.staff_name = 'ช่างบิว' AND staff_days.day_of_week = 2)
    ),
    '10:00:00'::time,
    '19:00:00'::time,
    '12:00:00'::time,
    '13:00:00'::time
FROM staff_days
ON CONFLICT (staff_id, day_of_week) DO UPDATE
SET shop_id = EXCLUDED.shop_id,
    is_working_day = EXCLUDED.is_working_day,
    work_start = EXCLUDED.work_start,
    work_end = EXCLUDED.work_end,
    break_start = EXCLUDED.break_start,
    break_end = EXCLUDED.break_end;

WITH demo_shop AS (
    SELECT id
    FROM local_service.shops
    WHERE slug = 'good-cuts-barber'
)
INSERT INTO local_service.shop_holidays (
    shop_id,
    staff_id,
    holiday_date,
    reason
)
SELECT
    demo_shop.id,
    NULL,
    DATE '2026-12-31',
    'วันหยุดพิเศษประจำปี'
FROM demo_shop
WHERE NOT EXISTS (
    SELECT 1
    FROM local_service.shop_holidays
    WHERE shop_holidays.shop_id = demo_shop.id
      AND shop_holidays.staff_id IS NULL
      AND shop_holidays.holiday_date = DATE '2026-12-31'
);
