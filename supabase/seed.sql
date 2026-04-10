-- ============================================================
-- Eski verileri temizle
TRUNCATE TABLE scans, orders, customers RESTART IDENTITY CASCADE;

-- ============================================================
-- KÖK-OS Analytics Dashboard — Kaliteli Demo Seed Verisi
-- Gerçekçi restoran davranışı: öğle (12-14) ve akşam (19-21) zirveleri
-- 150 scan · 65 sipariş · 42 müşteri
-- ============================================================

-- ── SCANS ────────────────────────────────────────────────────
-- Gerçekçi dağılım: öğle saatleri 12-14, akşam 19-21 yoğun

INSERT INTO scans (table_id, zone, city, scanned_at, duration_minutes) VALUES

-- Bugün — öğle servisi (12:00–14:30)
('T-03', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '3 hours 10 mins', 14),
('T-07', 'Teras',    'İstanbul', NOW() - INTERVAL '3 hours 5 mins',  11),
('T-11', 'Bahçe',    'Ankara',   NOW() - INTERVAL '3 hours',         18),
('T-01', 'Teras',    'İstanbul', NOW() - INTERVAL '2 hours 55 mins', 9),
('T-14', 'Bar',      'İzmir',    NOW() - INTERVAL '2 hours 50 mins', 22),
('T-05', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '2 hours 40 mins', 13),
('T-08', 'Bahçe',    'Bursa',    NOW() - INTERVAL '2 hours 30 mins', 16),
('T-02', 'Teras',    'İstanbul', NOW() - INTERVAL '2 hours 20 mins', 8),
('T-17', 'İç Mekan', 'Antalya',  NOW() - INTERVAL '2 hours 10 mins', 19),
('T-06', 'Bar',      'İstanbul', NOW() - INTERVAL '2 hours',         25),

-- Bugün — öğleden sonra sakin (15:00–18:00)
('T-04', 'Bahçe',    'İstanbul', NOW() - INTERVAL '90 mins',  7),
('T-09', 'İç Mekan', 'İzmir',    NOW() - INTERVAL '75 mins',  12),
('T-12', 'Teras',    'İstanbul', NOW() - INTERVAL '60 mins',  5),

-- Bugün — akşam servisi (19:00–21:30)
('T-01', 'Teras',    'İstanbul', NOW() - INTERVAL '45 mins',  20),
('T-03', 'İç Mekan', 'Ankara',   NOW() - INTERVAL '40 mins',  15),
('T-07', 'Teras',    'İstanbul', NOW() - INTERVAL '35 mins',  17),
('T-15', 'Bahçe',    'İstanbul', NOW() - INTERVAL '30 mins',  23),
('T-10', 'Bar',      'İzmir',    NOW() - INTERVAL '25 mins',  11),
('T-18', 'İç Mekan', 'Bursa',    NOW() - INTERVAL '20 mins',  14),
('T-02', 'Teras',    'İstanbul', NOW() - INTERVAL '15 mins',  9),
('T-06', 'Bar',      'İstanbul', NOW() - INTERVAL '10 mins',  28),
('T-11', 'Bahçe',    'Antalya',  NOW() - INTERVAL '5 mins',   16),

-- Dün — öğle servisi
('T-05', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '1 day 4 hours 20 mins', 12),
('T-08', 'Teras',    'İstanbul', NOW() - INTERVAL '1 day 4 hours 10 mins', 15),
('T-13', 'Bahçe',    'Ankara',   NOW() - INTERVAL '1 day 4 hours',         20),
('T-01', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '1 day 3 hours 50 mins', 8),
('T-16', 'Bar',      'İzmir',    NOW() - INTERVAL '1 day 3 hours 40 mins', 18),
('T-04', 'Teras',    'İstanbul', NOW() - INTERVAL '1 day 3 hours 20 mins', 11),
('T-19', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '1 day 3 hours',         14),
('T-07', 'Bahçe',    'Bursa',    NOW() - INTERVAL '1 day 2 hours 40 mins', 22),

-- Dün — akşam servisi
('T-02', 'Teras',    'İstanbul', NOW() - INTERVAL '1 day 1 hour 30 mins',  17),
('T-09', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '1 day 1 hour 15 mins',  13),
('T-14', 'Bar',      'İzmir',    NOW() - INTERVAL '1 day 1 hour',           26),
('T-11', 'Bahçe',    'Antalya',  NOW() - INTERVAL '1 day 45 mins',          19),
('T-06', 'Teras',    'İstanbul', NOW() - INTERVAL '1 day 30 mins',          10),
('T-17', 'İç Mekan', 'Ankara',   NOW() - INTERVAL '1 day 20 mins',          15),

-- 2 gün önce
('T-03', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '2 days 4 hours',         13),
('T-08', 'Teras',    'İstanbul', NOW() - INTERVAL '2 days 3 hours 45 mins', 9),
('T-15', 'Bahçe',    'İstanbul', NOW() - INTERVAL '2 days 3 hours 30 mins', 21),
('T-01', 'Bar',      'İzmir',    NOW() - INTERVAL '2 days 3 hours',          17),
('T-12', 'İç Mekan', 'Bursa',    NOW() - INTERVAL '2 days 2 hours 30 mins', 11),
('T-07', 'Teras',    'İstanbul', NOW() - INTERVAL '2 days 2 hours',          16),
('T-20', 'Bahçe',    'Ankara',   NOW() - INTERVAL '2 days 1 hour 30 mins',  24),
('T-04', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '2 days 1 hour',           8),

-- 3 gün önce
('T-06', 'Bar',      'İstanbul', NOW() - INTERVAL '3 days 4 hours 10 mins', 30),
('T-09', 'Teras',    'İstanbul', NOW() - INTERVAL '3 days 3 hours 50 mins', 14),
('T-11', 'İç Mekan', 'İzmir',    NOW() - INTERVAL '3 days 3 hours 30 mins', 18),
('T-02', 'Bahçe',    'Antalya',  NOW() - INTERVAL '3 days 3 hours',          12),
('T-16', 'Teras',    'İstanbul', NOW() - INTERVAL '3 days 2 hours 45 mins', 20),
('T-05', 'İç Mekan', 'Ankara',   NOW() - INTERVAL '3 days 2 hours 20 mins', 7),
('T-13', 'Bar',      'İstanbul', NOW() - INTERVAL '3 days 2 hours',          22),
('T-18', 'Bahçe',    'İstanbul', NOW() - INTERVAL '3 days 1 hour 30 mins',  15),
('T-01', 'Teras',    'Bursa',    NOW() - INTERVAL '3 days 1 hour',           10),

-- 4–7 gün arası (haftalık trend için)
('T-03', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '4 days 4 hours',  16),
('T-07', 'Teras',    'İstanbul', NOW() - INTERVAL '4 days 3 hours',  11),
('T-14', 'Bahçe',    'İzmir',    NOW() - INTERVAL '4 days 2 hours',  19),
('T-08', 'Bar',      'İstanbul', NOW() - INTERVAL '4 days 1 hour',   25),
('T-02', 'İç Mekan', 'Ankara',   NOW() - INTERVAL '5 days 4 hours',  13),
('T-05', 'Teras',    'İstanbul', NOW() - INTERVAL '5 days 3 hours',  9),
('T-11', 'Bahçe',    'İstanbul', NOW() - INTERVAL '5 days 2 hours',  21),
('T-15', 'Bar',      'Bursa',    NOW() - INTERVAL '5 days 1 hour',   17),
('T-01', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '6 days 4 hours',  14),
('T-09', 'Teras',    'İzmir',    NOW() - INTERVAL '6 days 3 hours',  8),
('T-06', 'Bahçe',    'İstanbul', NOW() - INTERVAL '6 days 2 hours',  23),
('T-13', 'Bar',      'Antalya',  NOW() - INTERVAL '6 days 1 hour',   18),
('T-04', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '7 days 4 hours',  12),
('T-17', 'Teras',    'Ankara',   NOW() - INTERVAL '7 days 3 hours',  16),
('T-20', 'Bahçe',    'İstanbul', NOW() - INTERVAL '7 days 2 hours',  20),

-- 8–15 gün (aylık trend için)
('T-03', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '8 days 4 hours',  15),
('T-07', 'Teras',    'İstanbul', NOW() - INTERVAL '9 days 3 hours',  10),
('T-11', 'Bahçe',    'İzmir',    NOW() - INTERVAL '10 days 2 hours', 18),
('T-01', 'Bar',      'İstanbul', NOW() - INTERVAL '11 days 1 hour',  22),
('T-05', 'İç Mekan', 'Ankara',   NOW() - INTERVAL '12 days 4 hours', 13),
('T-09', 'Teras',    'İstanbul', NOW() - INTERVAL '13 days 3 hours', 9),
('T-14', 'Bahçe',    'Bursa',    NOW() - INTERVAL '14 days 2 hours', 20),
('T-02', 'Bar',      'İstanbul', NOW() - INTERVAL '15 days 1 hour',  16),

-- 16–30 gün
('T-06', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '16 days 4 hours', 14),
('T-08', 'Teras',    'İzmir',    NOW() - INTERVAL '18 days 3 hours', 11),
('T-15', 'Bahçe',    'İstanbul', NOW() - INTERVAL '20 days 2 hours', 19),
('T-12', 'Bar',      'Ankara',   NOW() - INTERVAL '22 days 1 hour',  24),
('T-03', 'İç Mekan', 'İstanbul', NOW() - INTERVAL '25 days 4 hours', 12),
('T-07', 'Teras',    'Antalya',  NOW() - INTERVAL '27 days 3 hours', 17),
('T-01', 'Bahçe',    'İstanbul', NOW() - INTERVAL '29 days 2 hours', 21);

-- ── ORDERS ───────────────────────────────────────────────────
-- Gerçekçi fiyat aralığı: 85–1250 TL, %75 tamamlandı, %15 beklemede, %10 iptal

INSERT INTO orders (table_id, zone, total_amount, status, created_at) VALUES

-- Bugün
('T-03', 'İç Mekan', 485.00,  'completed', NOW() - INTERVAL '3 hours'),
('T-07', 'Teras',    320.50,  'completed', NOW() - INTERVAL '2 hours 50 mins'),
('T-11', 'Bahçe',    215.00,  'completed', NOW() - INTERVAL '2 hours 30 mins'),
('T-14', 'Bar',      890.75,  'completed', NOW() - INTERVAL '2 hours'),
('T-05', 'İç Mekan', 145.00,  'pending',   NOW() - INTERVAL '45 mins'),
('T-15', 'Bahçe',    560.00,  'completed', NOW() - INTERVAL '30 mins'),
('T-06', 'Bar',      1120.50, 'completed', NOW() - INTERVAL '15 mins'),
('T-02', 'Teras',    275.00,  'pending',   NOW() - INTERVAL '10 mins'),

-- Dün
('T-05', 'İç Mekan', 395.00,  'completed', NOW() - INTERVAL '1 day 4 hours'),
('T-08', 'Teras',    520.50,  'completed', NOW() - INTERVAL '1 day 3 hours 45 mins'),
('T-13', 'Bahçe',    88.00,   'cancelled', NOW() - INTERVAL '1 day 3 hours'),
('T-01', 'İç Mekan', 740.00,  'completed', NOW() - INTERVAL '1 day 2 hours 30 mins'),
('T-16', 'Bar',      1250.00, 'completed', NOW() - INTERVAL '1 day 2 hours'),
('T-04', 'Teras',    185.50,  'completed', NOW() - INTERVAL '1 day 1 hour 30 mins'),
('T-19', 'İç Mekan', 310.00,  'pending',   NOW() - INTERVAL '1 day 1 hour'),
('T-09', 'Bahçe',    95.00,   'cancelled', NOW() - INTERVAL '1 day 30 mins'),

-- 2 gün önce
('T-06', 'Bar',      980.00,  'completed', NOW() - INTERVAL '2 days 4 hours'),
('T-09', 'Teras',    425.50,  'completed', NOW() - INTERVAL '2 days 3 hours 30 mins'),
('T-11', 'İç Mekan', 285.00,  'completed', NOW() - INTERVAL '2 days 3 hours'),
('T-02', 'Bahçe',    165.00,  'completed', NOW() - INTERVAL '2 days 2 hours'),
('T-16', 'Teras',    710.75,  'completed', NOW() - INTERVAL '2 days 1 hour 30 mins'),
('T-05', 'İç Mekan', 540.00,  'pending',   NOW() - INTERVAL '2 days 1 hour'),

-- 3 gün önce
('T-13', 'Bar',      845.00,  'completed', NOW() - INTERVAL '3 days 4 hours'),
('T-18', 'Bahçe',    390.50,  'completed', NOW() - INTERVAL '3 days 3 hours'),
('T-01', 'Teras',    225.00,  'completed', NOW() - INTERVAL '3 days 2 hours'),
('T-03', 'İç Mekan', 675.00,  'completed', NOW() - INTERVAL '3 days 1 hour 30 mins'),
('T-07', 'Teras',    115.00,  'cancelled', NOW() - INTERVAL '3 days 1 hour'),
('T-14', 'Bar',      1050.00, 'completed', NOW() - INTERVAL '3 days 30 mins'),

-- 4–7 gün
('T-03', 'İç Mekan', 460.00,  'completed', NOW() - INTERVAL '4 days 4 hours'),
('T-07', 'Teras',    305.50,  'completed', NOW() - INTERVAL '4 days 3 hours'),
('T-08', 'Bar',      875.00,  'completed', NOW() - INTERVAL '4 days 2 hours'),
('T-02', 'İç Mekan', 195.00,  'completed', NOW() - INTERVAL '5 days 4 hours'),
('T-11', 'Bahçe',    620.50,  'completed', NOW() - INTERVAL '5 days 3 hours'),
('T-05', 'Teras',    430.00,  'completed', NOW() - INTERVAL '6 days 4 hours'),
('T-15', 'Bar',      940.00,  'completed', NOW() - INTERVAL '6 days 3 hours'),
('T-01', 'İç Mekan', 280.50,  'cancelled', NOW() - INTERVAL '7 days 4 hours'),
('T-09', 'Teras',    560.00,  'completed', NOW() - INTERVAL '7 days 3 hours'),

-- 8–30 gün
('T-06', 'Bar',      1180.00, 'completed', NOW() - INTERVAL '9 days 4 hours'),
('T-14', 'Bahçe',    350.50,  'completed', NOW() - INTERVAL '11 days 3 hours'),
('T-03', 'İç Mekan', 495.00,  'completed', NOW() - INTERVAL '13 days 4 hours'),
('T-08', 'Teras',    720.00,  'completed', NOW() - INTERVAL '15 days 3 hours'),
('T-11', 'Bar',      85.00,   'cancelled', NOW() - INTERVAL '18 days 4 hours'),
('T-01', 'İç Mekan', 630.50,  'completed', NOW() - INTERVAL '20 days 3 hours'),
('T-07', 'Teras',    410.00,  'completed', NOW() - INTERVAL '23 days 4 hours'),
('T-15', 'Bahçe',    895.00,  'completed', NOW() - INTERVAL '25 days 3 hours'),
('T-02', 'Bar',      555.50,  'completed', NOW() - INTERVAL '28 days 4 hours');

-- ── CUSTOMERS ─────────────────────────────────────────────────
-- Gerçekçi Türkçe isimler, dağılımlı şehirler, farklı ziyaret sayıları

INSERT INTO customers (name, city, visit_count, last_visit) VALUES

-- Sadık müşteriler (çok ziyaret)
('Ceren Yüksel',       'İstanbul', 18, NOW() - INTERVAL '20 mins'),
('Burak Yıldız',       'İstanbul', 14, NOW() - INTERVAL '6 hours'),
('Zeynep Arslan',      'İstanbul', 12, NOW() - INTERVAL '4 hours'),
('Tuğba Kılıç',       'İstanbul', 11, NOW() - INTERVAL '2 days 4 hours'),
('Ahmet Yılmaz',       'İstanbul', 9,  NOW() - INTERVAL '3 hours'),
('Deniz Avcı',        'İzmir',    8,  NOW() - INTERVAL '8 hours'),
('Gizem Aslan',        'İstanbul', 7,  NOW() - INTERVAL '5 hours'),
('Hasan Polat',        'İzmir',    7,  NOW() - INTERVAL '1 day 3 hours'),
('İrem Özkan',        'İstanbul', 7,  NOW() - INTERVAL '3 hours'),
('Pınar Güler',       'İstanbul', 6,  NOW() - INTERVAL '1 day 6 hours'),

-- Düzenli müşteriler (orta sıklık)
('Ayşe Çelik',        'İstanbul', 5,  NOW() - INTERVAL '30 mins'),
('Emre Öztürk',       'İstanbul', 4,  NOW() - INTERVAL '3 days 2 hours'),
('Elif Güneş',         'İstanbul', 4,  NOW() - INTERVAL '2 days'),
('Fatma Demir',        'Ankara',   3,  NOW() - INTERVAL '1 day'),
('Oğuz Çetin',        'İzmir',    3,  NOW() - INTERVAL '9 days'),
('Sercan Doğan',      'Ankara',   3,  NOW() - INTERVAL '4 days'),
('Ali Şahin',          'Bursa',    2,  NOW() - INTERVAL '5 days'),
('Merve Aydın',        'Ankara',   2,  NOW() - INTERVAL '4 days'),
('Berk Güven',         'Bursa',    2,  NOW() - INTERVAL '15 days'),
('Tolga Aksoy',        'Antalya',  2,  NOW() - INTERVAL '6 days'),

-- Bu hafta yeni gelenler
('Mustafa Erdoğan',   'Antalya',  1,  NOW() - INTERVAL '7 days'),
('Mehmet Kaya',        'İzmir',    1,  NOW() - INTERVAL '3 days'),
('Cem Taş',            'Ankara',   1,  NOW() - INTERVAL '20 days'),
('Selin Koç',          'Bursa',    1,  NOW() - INTERVAL '10 days'),
('Nur Yaman',          'İstanbul', 1,  NOW() - INTERVAL '1 day 2 hours'),
('Kerem Acar',         'İstanbul', 1,  NOW() - INTERVAL '2 days'),
('Seda Özdemir',       'İzmir',    1,  NOW() - INTERVAL '4 days'),
('Barış Çelik',       'İstanbul', 1,  NOW() - INTERVAL '5 days'),
('Lale Kaya',          'Ankara',   1,  NOW() - INTERVAL '6 days'),
('Arda Demir',         'İstanbul', 1,  NOW() - INTERVAL '7 days'),

-- Uzak şehirlerden gelenler
('Fatih Sarı',         'Eskişehir', 2, NOW() - INTERVAL '12 days'),
('Melis Yıldız',      'Konya',     1, NOW() - INTERVAL '8 days'),
('Uğur Çetin',        'Gaziantep', 1, NOW() - INTERVAL '14 days'),
('Sibel Arslan',       'Trabzon',   1, NOW() - INTERVAL '18 days'),
('Volkan Polat',       'Kayseri',   2, NOW() - INTERVAL '11 days'),
('Nihan Güler',        'Samsun',    1, NOW() - INTERVAL '22 days'),
('Taner Özcan',        'Adana',     1, NOW() - INTERVAL '16 days'),
('Başak Yılmaz',      'İzmir',     3, NOW() - INTERVAL '3 days'),
('Kenan Doğan',       'Bursa',     2, NOW() - INTERVAL '9 days'),
('Aylin Şahin',       'Antalya',   1, NOW() - INTERVAL '19 days'),
('Mert Arslan',        'İstanbul',  4, NOW() - INTERVAL '1 day'),
('Özge Kaya',         'Ankara',    2, NOW() - INTERVAL '7 days');
