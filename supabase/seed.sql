-- ============================================================
-- MOCK DATA SEED — Silifke STT QR Analitik Dashboard
-- 15 isletme, 30 gunluk scan/order/customer verisi
-- ============================================================

TRUNCATE TABLE customers, orders, scans, businesses RESTART IDENTITY CASCADE;

-- ── BUSINESSES ────────────────────────────────────────────────
INSERT INTO businesses (name, city, plan, status, owner_email, created_at, last_active_at) VALUES
  ('Liman Balik Restaurant', 'Silifke',  'pro',        'active',   'liman@example.com',     NOW() - INTERVAL '90 days',  NOW() - INTERVAL '1 hour'),
  ('Tas Han Kahvalti',       'Silifke',  'starter',    'active',   'tashan@example.com',    NOW() - INTERVAL '60 days',  NOW() - INTERVAL '3 hours'),
  ('Cennet Bogazi Cafe',     'Silifke',  'pro',        'active',   'cennet@example.com',    NOW() - INTERVAL '45 days',  NOW() - INTERVAL '2 hours'),
  ('Goksu Doner',            'Silifke',  'starter',    'active',   'goksu@example.com',     NOW() - INTERVAL '30 days',  NOW() - INTERVAL '5 hours'),
  ('Akdeniz Pide Salonu',    'Mersin',   'enterprise', 'active',   'akdeniz@example.com',   NOW() - INTERVAL '120 days', NOW() - INTERVAL '30 minutes'),
  ('Narlikuyu Sofrasi',      'Mersin',   'pro',        'active',   'narlikuyu@example.com', NOW() - INTERVAL '75 days',  NOW() - INTERVAL '4 hours'),
  ('Kizkalesi Bistro',       'Erdemli',  'starter',    'active',   'kizkalesi@example.com', NOW() - INTERVAL '20 days',  NOW() - INTERVAL '1 day'),
  ('Mut Kebap Evi',          'Mut',      'trial',      'trial',    'mut@example.com',       NOW() - INTERVAL '10 days',  NOW() - INTERVAL '2 days'),
  ('Aydincik Balik',         'Aydincik', 'starter',    'active',   'aydincik@example.com',  NOW() - INTERVAL '55 days',  NOW() - INTERVAL '6 hours'),
  ('Bozyazi Sahil Cafe',     'Bozyazi',  'trial',      'inactive', 'bozyazi@example.com',   NOW() - INTERVAL '40 days',  NOW() - INTERVAL '18 days'),
  ('Tarsus Selale Restoran', 'Tarsus',   'pro',        'active',   'tarsus@example.com',    NOW() - INTERVAL '100 days', NOW() - INTERVAL '2 hours'),
  ('Pozcu Yoresel Mutfak',   'Silifke',  'starter',    'active',   'pozcu@example.com',     NOW() - INTERVAL '15 days',  NOW() - INTERVAL '8 hours'),
  ('Adanali Usta Ocakbasi',  'Adana',    'enterprise', 'active',   'adanali@example.com',   NOW() - INTERVAL '150 days', NOW() - INTERVAL '1 hour'),
  ('Gulnar Organik Koy Evi', 'Gulnar',   'trial',      'trial',    'gulnar@example.com',    NOW() - INTERVAL '5 days',   NOW() - INTERVAL '3 days'),
  ('Iskele Balikci',         'Silifke',  'pro',        'active',   'iskele@example.com',    NOW() - INTERVAL '80 days',  NOW() - INTERVAL '45 minutes');


-- ── SCANS — generate_series ile 30 gunluk gercekci veri ──────
INSERT INTO scans (business_id, table_id, zone, city, scanned_at, duration_minutes)
SELECT
  b.id,
  'T' || LPAD((floor(random() * 20 + 1))::text, 2, '0'),
  (ARRAY['Ic Mekan','Teras','Bahce','Bar'])[floor(random()*4+1)::int],
  b.city,
  NOW() - (random() * INTERVAL '30 days'),
  (floor(random() * 90 + 5))::int
FROM businesses b,
  generate_series(1,
    CASE b.plan
      WHEN 'enterprise' THEN 200
      WHEN 'pro'        THEN 130
      WHEN 'starter'    THEN 65
      ELSE 20
    END
  ) s
WHERE b.status IN ('active','trial');

-- Yogun saatler ekstra scan (12-14 ve 19-22)
INSERT INTO scans (business_id, table_id, zone, city, scanned_at, duration_minutes)
SELECT
  b.id,
  'T' || LPAD((floor(random() * 20 + 1))::text, 2, '0'),
  (ARRAY['Ic Mekan','Teras','Bahce'])[floor(random()*3+1)::int],
  b.city,
  date_trunc('day', NOW() - (random() * INTERVAL '7 days')) +
    make_interval(
      hours => (ARRAY[12,13,14,19,20,21,22])[floor(random()*7+1)::int],
      mins  => (floor(random()*59))::int
    ),
  (floor(random() * 60 + 10))::int
FROM businesses b, generate_series(1, 50) s
WHERE b.status = 'active';

-- Inactive isletme (10: Bozyazi) — sadece eski scan
INSERT INTO scans (business_id, table_id, zone, city, scanned_at, duration_minutes)
SELECT
  10,
  'T' || LPAD((floor(random()*10+1))::text, 2, '0'),
  (ARRAY['Ic Mekan','Teras'])[floor(random()*2+1)::int],
  'Bozyazi',
  NOW() - INTERVAL '18 days' - (random() * INTERVAL '12 days'),
  (floor(random()*45+5))::int
FROM generate_series(1, 15) s;


-- ── ORDERS ────────────────────────────────────────────────────
INSERT INTO orders (business_id, table_id, zone, total_amount, status, created_at)
SELECT
  b.id,
  'T' || LPAD((floor(random()*20+1))::text, 2, '0'),
  (ARRAY['Ic Mekan','Teras','Bahce'])[floor(random()*3+1)::int],
  round((random()*800+80)::numeric, 2),
  (ARRAY['completed','completed','completed','completed','completed','completed','completed','completed','pending','cancelled'])[floor(random()*10+1)::int],
  NOW() - (random() * INTERVAL '30 days')
FROM businesses b, generate_series(1,
  CASE b.plan WHEN 'enterprise' THEN 90 WHEN 'pro' THEN 55 WHEN 'starter' THEN 28 ELSE 10 END
) s;


-- ── CUSTOMERS ─────────────────────────────────────────────────
INSERT INTO customers (business_id, name, city, visit_count, last_visit) VALUES
(1,'Ahmet Yilmaz',   'Silifke',  12, NOW() - INTERVAL '1 day'),
(1,'Fatma Kaya',     'Silifke',   8, NOW() - INTERVAL '2 days'),
(1,'Mehmet Celik',   'Silifke',   5, NOW() - INTERVAL '3 hours'),
(1,'Ayse Demir',     'Silifke',   3, NOW() - INTERVAL '6 hours'),
(2,'Mustafa Sahin',  'Silifke',   9, NOW() - INTERVAL '1 day'),
(2,'Zeynep Arslan',  'Silifke',   4, NOW() - INTERVAL '4 hours'),
(3,'Ali Koc',        'Silifke',  11, NOW() - INTERVAL '2 hours'),
(3,'Selin Gunes',    'Silifke',   6, NOW() - INTERVAL '5 hours'),
(4,'Can Aydin',      'Silifke',   2, NOW() - INTERVAL '1 week'),
(5,'Hasan Ozturk',   'Mersin',   20, NOW() - INTERVAL '1 hour'),
(5,'Elif Yildiz',    'Mersin',   14, NOW() - INTERVAL '2 hours'),
(5,'Burak Erdogan',  'Mersin',   18, NOW() - INTERVAL '30 minutes'),
(6,'Merve Polat',    'Mersin',    7, NOW() - INTERVAL '3 hours'),
(6,'Serkan Dogan',   'Mersin',   13, NOW() - INTERVAL '5 hours'),
(7,'Gulsen Yurt',    'Erdemli',   6, NOW() - INTERVAL '1 day'),
(8,'Tolga Aktas',    'Mut',       1, NOW() - INTERVAL '3 days'),
(9,'Pinar Ozdemir',  'Aydincik',  4, NOW() - INTERVAL '1 day'),
(10,'Emre Kaplan',   'Bozyazi',   3, NOW() - INTERVAL '20 days'),
(11,'Ali Bas',       'Tarsus',    8, NOW() - INTERVAL '2 hours'),
(11,'Deniz Karaca',  'Tarsus',   11, NOW() - INTERVAL '1 hour'),
(12,'Nazli Simsek',  'Silifke',   2, NOW() - INTERVAL '4 hours'),
(13,'Tarik Basaran', 'Adana',    22, NOW() - INTERVAL '45 minutes'),
(13,'Ceren Uslu',    'Adana',    17, NOW() - INTERVAL '1 hour'),
(13,'Berk Sonmez',   'Adana',    15, NOW() - INTERVAL '2 hours'),
(14,'Riya Cakir',    'Gulnar',    1, NOW() - INTERVAL '4 days'),
(15,'Cem Karadeniz', 'Silifke',  16, NOW() - INTERVAL '30 minutes'),
(15,'Nalan Guler',   'Silifke',  10, NOW() - INTERVAL '1 hour'),
(15,'Tuba Yildirim', 'Silifke',   7, NOW() - INTERVAL '3 hours');
