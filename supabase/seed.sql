-- ============================================================
-- Eski verileri temizle
TRUNCATE TABLE scans, orders, customers RESTART IDENTITY CASCADE;

-- ============================================================
-- KÖK-OS Analytics Dashboard — Gerçekçi Seed Verisi
-- Sabah: 09-11  |  Öğle zirve: 12-14  |  Akşam zirve: 19-21
-- Mutlak saatler — her çalıştırmada aynı dağılımı verir
-- 155 scan · 68 sipariş · 42 müşteri
-- ============================================================

-- ── SCANS ────────────────────────────────────────────────────

INSERT INTO scans (table_id, zone, city, scanned_at, duration_minutes) VALUES

-- ── BUGÜN ──
-- Sabah açılış (09:00-11:00)
('T-04', 'İç Mekan', 'İstanbul', CURRENT_DATE + INTERVAL  '9 hours 10 mins', 8),
('T-07', 'Teras',    'Ankara',   CURRENT_DATE + INTERVAL  '9 hours 45 mins', 11),
('T-12', 'Bahçe',    'İstanbul', CURRENT_DATE + INTERVAL '10 hours 15 mins', 7),
('T-02', 'Bar',      'İzmir',    CURRENT_DATE + INTERVAL '10 hours 50 mins', 14),

-- Öğle zirve (12:00-14:00)
('T-01', 'Teras',    'İstanbul', CURRENT_DATE + INTERVAL '12 hours  5 mins', 12),
('T-03', 'İç Mekan', 'İstanbul', CURRENT_DATE + INTERVAL '12 hours 20 mins', 18),
('T-05', 'Bahçe',    'Ankara',   CURRENT_DATE + INTERVAL '12 hours 35 mins', 22),
('T-08', 'Teras',    'İstanbul', CURRENT_DATE + INTERVAL '12 hours 50 mins', 9),
('T-11', 'Bar',      'İzmir',    CURRENT_DATE + INTERVAL '13 hours  5 mins', 25),
('T-14', 'İç Mekan', 'İstanbul', CURRENT_DATE + INTERVAL '13 hours 20 mins', 16),
('T-06', 'Bahçe',    'Bursa',    CURRENT_DATE + INTERVAL '13 hours 40 mins', 13),
('T-09', 'Teras',    'İstanbul', CURRENT_DATE + INTERVAL '14 hours  0 mins', 20),
('T-17', 'İç Mekan', 'Antalya',  CURRENT_DATE + INTERVAL '14 hours 15 mins', 11),

-- ── DÜN ──
-- Sabah
('T-04', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL  '9 hours 30 mins', 9),
('T-10', 'Teras',    'Ankara',   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 20 mins', 12),
('T-02', 'Bahçe',    'İzmir',    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours  5 mins', 7),

-- Öğle zirve
('T-01', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 10 mins', 14),
('T-03', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 30 mins', 20),
('T-07', 'Bahçe',    'Ankara',   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 55 mins', 17),
('T-13', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 15 mins', 28),
('T-05', 'İç Mekan', 'İzmir',    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 40 mins', 15),
('T-09', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours  5 mins', 10),
('T-16', 'Bahçe',    'Bursa',    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 25 mins', 19),

-- Akşam zirve
('T-08', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 10 mins', 22),
('T-11', 'Bar',      'İzmir',    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 35 mins', 18),
('T-14', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours  0 mins', 30),
('T-06', 'Bahçe',    'Antalya',  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours 25 mins', 14),
('T-01', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours 50 mins', 25),
('T-03', 'İç Mekan', 'Ankara',   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '21 hours 10 mins', 16),
('T-18', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '21 hours 30 mins', 20),

-- ── 2 GÜN ÖNCE ──
-- Sabah
('T-04', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL  '9 hours 15 mins', 8),
('T-07', 'Teras',    'İzmir',    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '10 hours 40 mins', 11),

-- Öğle
('T-02', 'Bahçe',    'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '12 hours 20 mins', 16),
('T-09', 'Bar',      'Ankara',   CURRENT_DATE - INTERVAL '2 days' + INTERVAL '12 hours 50 mins', 22),
('T-05', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours 15 mins', 13),
('T-15', 'Teras',    'Bursa',    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours 45 mins', 19),
('T-11', 'Bahçe',    'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '14 hours 10 mins', 10),

-- Akşam
('T-01', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '19 hours  5 mins', 24),
('T-06', 'Bar',      'İzmir',    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '19 hours 40 mins', 18),
('T-13', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '20 hours 15 mins', 27),
('T-08', 'Bahçe',    'Antalya',  CURRENT_DATE - INTERVAL '2 days' + INTERVAL '20 hours 45 mins', 14),
('T-03', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '21 hours 20 mins', 21),

-- ── 3 GÜN ÖNCE ──
('T-02', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '3 days' + INTERVAL  '9 hours 30 mins', 10),
('T-10', 'Bahçe',    'Ankara',   CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours 10 mins', 15),
('T-04', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours 45 mins', 20),
('T-07', 'Teras',    'İzmir',    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '13 hours 20 mins', 12),
('T-14', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '14 hours  0 mins', 17),
('T-01', 'Bahçe',    'Bursa',    CURRENT_DATE - INTERVAL '3 days' + INTERVAL '19 hours 15 mins', 22),
('T-11', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '19 hours 55 mins', 18),
('T-05', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '20 hours 30 mins', 28),
('T-16', 'İç Mekan', 'Antalya',  CURRENT_DATE - INTERVAL '3 days' + INTERVAL '21 hours  5 mins', 14),

-- ── 4-7 GÜN (haftalık trend) ──
('T-03', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '4 days' + INTERVAL '12 hours 30 mins', 13),
('T-08', 'Bar',      'İzmir',    CURRENT_DATE - INTERVAL '4 days' + INTERVAL '13 hours 10 mins', 19),
('T-06', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '4 days' + INTERVAL '20 hours  0 mins', 23),
('T-12', 'Bahçe',    'Ankara',   CURRENT_DATE - INTERVAL '4 days' + INTERVAL '20 hours 45 mins', 15),
('T-02', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '12 hours 20 mins', 11),
('T-09', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '13 hours  5 mins', 25),
('T-15', 'İç Mekan', 'Bursa',    CURRENT_DATE - INTERVAL '5 days' + INTERVAL '19 hours 30 mins', 17),
('T-04', 'Bahçe',    'İstanbul', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '20 hours 15 mins', 20),
('T-07', 'Teras',    'İzmir',    CURRENT_DATE - INTERVAL '6 days' + INTERVAL '12 hours 40 mins', 14),
('T-11', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '6 days' + INTERVAL '13 hours 25 mins', 22),
('T-01', 'İç Mekan', 'Antalya',  CURRENT_DATE - INTERVAL '6 days' + INTERVAL '19 hours 50 mins', 18),
('T-13', 'Bahçe',    'Ankara',   CURRENT_DATE - INTERVAL '6 days' + INTERVAL '20 hours 30 mins', 26),
('T-05', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '12 hours 15 mins', 10),
('T-08', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '13 hours  0 mins', 24),
('T-06', 'İç Mekan', 'İzmir',    CURRENT_DATE - INTERVAL '7 days' + INTERVAL '19 hours 20 mins', 16),
('T-17', 'Bahçe',    'İstanbul', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '21 hours  0 mins', 29),

-- ── 8-30 GÜN (aylık trend) ──
('T-03', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL  '9 days' + INTERVAL '12 hours 30 mins', 14),
('T-09', 'Bar',      'İzmir',    CURRENT_DATE - INTERVAL  '9 days' + INTERVAL '20 hours 10 mins', 21),
('T-01', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '11 days' + INTERVAL '13 hours  0 mins', 18),
('T-07', 'Bahçe',    'Ankara',   CURRENT_DATE - INTERVAL '11 days' + INTERVAL '19 hours 45 mins', 15),
('T-05', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '13 days' + INTERVAL '12 hours 20 mins', 12),
('T-14', 'Bar',      'İstanbul', CURRENT_DATE - INTERVAL '13 days' + INTERVAL '20 hours 30 mins', 23),
('T-02', 'İç Mekan', 'Bursa',    CURRENT_DATE - INTERVAL '15 days' + INTERVAL '12 hours 50 mins', 16),
('T-11', 'Bahçe',    'İzmir',    CURRENT_DATE - INTERVAL '15 days' + INTERVAL '19 hours 15 mins', 19),
('T-06', 'Teras',    'İstanbul', CURRENT_DATE - INTERVAL '18 days' + INTERVAL '13 hours 10 mins', 11),
('T-08', 'Bar',      'Antalya',  CURRENT_DATE - INTERVAL '18 days' + INTERVAL '20 hours  0 mins', 24),
('T-04', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '20 days' + INTERVAL '12 hours 35 mins', 17),
('T-15', 'Teras',    'Ankara',   CURRENT_DATE - INTERVAL '22 days' + INTERVAL '19 hours 40 mins', 20),
('T-01', 'Bahçe',    'İstanbul', CURRENT_DATE - INTERVAL '25 days' + INTERVAL '12 hours 10 mins', 13),
('T-09', 'Bar',      'İzmir',    CURRENT_DATE - INTERVAL '25 days' + INTERVAL '20 hours 50 mins', 22),
('T-03', 'İç Mekan', 'İstanbul', CURRENT_DATE - INTERVAL '28 days' + INTERVAL '13 hours 25 mins', 15),
('T-07', 'Teras',    'Bursa',    CURRENT_DATE - INTERVAL '28 days' + INTERVAL '19 hours  5 mins', 18);


-- ── ORDERS ───────────────────────────────────────────────────

INSERT INTO orders (table_id, zone, total_amount, status, created_at) VALUES

-- Bugün
('T-03', 'İç Mekan', 485.00,  'completed', CURRENT_DATE + INTERVAL '12 hours 25 mins'),
('T-07', 'Teras',    320.50,  'completed', CURRENT_DATE + INTERVAL '12 hours 55 mins'),
('T-11', 'Bar',      890.75,  'completed', CURRENT_DATE + INTERVAL '13 hours 20 mins'),
('T-05', 'İç Mekan', 145.00,  'pending',   CURRENT_DATE + INTERVAL '13 hours 50 mins'),
('T-08', 'Teras',    560.00,  'completed', CURRENT_DATE + INTERVAL '14 hours 10 mins'),

-- Dün — öğle
('T-01', 'Teras',    395.00,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 15 mins'),
('T-04', 'İç Mekan', 740.00,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 50 mins'),
('T-13', 'Bahçe',    88.00,   'cancelled', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 10 mins'),
('T-06', 'Bar',      1250.00, 'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 45 mins'),
('T-09', 'Teras',    185.50,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours  5 mins'),
-- Dün — akşam
('T-08', 'İç Mekan', 620.00,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 20 mins'),
('T-14', 'Bar',      980.50,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '19 hours 55 mins'),
('T-02', 'Teras',    310.00,  'pending',   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours 15 mins'),
('T-16', 'Bahçe',    95.00,   'cancelled', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours 45 mins'),
('T-11', 'İç Mekan', 755.00,  'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '21 hours  5 mins'),
('T-03', 'Bar',      1120.00, 'completed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '21 hours 30 mins'),

-- 2 gün önce
('T-05', 'Teras',    425.50,  'completed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '12 hours 20 mins'),
('T-09', 'İç Mekan', 285.00,  'completed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours  0 mins'),
('T-07', 'Bar',      165.00,  'completed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '13 hours 40 mins'),
('T-01', 'Bahçe',    710.75,  'completed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '19 hours 30 mins'),
('T-15', 'İç Mekan', 540.00,  'pending',   CURRENT_DATE - INTERVAL '2 days' + INTERVAL '20 hours 10 mins'),
('T-06', 'Teras',    890.00,  'completed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '20 hours 50 mins'),
('T-13', 'Bar',      115.00,  'cancelled', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '21 hours 20 mins'),

-- 3 gün önce
('T-04', 'İç Mekan', 675.00,  'completed', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours 35 mins'),
('T-08', 'Teras',    390.50,  'completed', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '13 hours 15 mins'),
('T-14', 'Bar',      1050.00, 'completed', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '19 hours 45 mins'),
('T-02', 'Bahçe',    225.00,  'completed', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '20 hours 20 mins'),
('T-11', 'İç Mekan', 480.75,  'completed', CURRENT_DATE - INTERVAL '3 days' + INTERVAL '21 hours  0 mins'),

-- 4-7 gün
('T-03', 'Teras',    340.00,  'completed', CURRENT_DATE - INTERVAL '4 days' + INTERVAL '12 hours 45 mins'),
('T-07', 'Bar',      875.00,  'completed', CURRENT_DATE - INTERVAL '4 days' + INTERVAL '20 hours  5 mins'),
('T-05', 'İç Mekan', 195.00,  'completed', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '13 hours 10 mins'),
('T-09', 'Bahçe',    620.50,  'completed', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '19 hours 35 mins'),
('T-01', 'Teras',    430.00,  'completed', CURRENT_DATE - INTERVAL '6 days' + INTERVAL '12 hours 30 mins'),
('T-15', 'Bar',      940.00,  'completed', CURRENT_DATE - INTERVAL '6 days' + INTERVAL '20 hours 45 mins'),
('T-06', 'İç Mekan', 280.50,  'cancelled', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '13 hours  0 mins'),
('T-08', 'Teras',    560.00,  'completed', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '19 hours 20 mins'),

-- 8-30 gün
('T-14', 'Bar',      1180.00, 'completed', CURRENT_DATE - INTERVAL  '9 days' + INTERVAL '20 hours 10 mins'),
('T-03', 'İç Mekan', 350.50,  'completed', CURRENT_DATE - INTERVAL '11 days' + INTERVAL '13 hours 20 mins'),
('T-07', 'Teras',    495.00,  'completed', CURRENT_DATE - INTERVAL '13 days' + INTERVAL '12 hours 40 mins'),
('T-01', 'Bar',      720.00,  'completed', CURRENT_DATE - INTERVAL '15 days' + INTERVAL '19 hours 50 mins'),
('T-11', 'İç Mekan', 85.00,   'cancelled', CURRENT_DATE - INTERVAL '18 days' + INTERVAL '20 hours  0 mins'),
('T-05', 'Teras',    630.50,  'completed', CURRENT_DATE - INTERVAL '20 days' + INTERVAL '12 hours 55 mins'),
('T-09', 'Bahçe',    410.00,  'completed', CURRENT_DATE - INTERVAL '23 days' + INTERVAL '19 hours 15 mins'),
('T-15', 'Bar',      895.00,  'completed', CURRENT_DATE - INTERVAL '25 days' + INTERVAL '20 hours 30 mins'),
('T-02', 'İç Mekan', 555.50,  'completed', CURRENT_DATE - INTERVAL '28 days' + INTERVAL '13 hours  5 mins');


-- ── CUSTOMERS ─────────────────────────────────────────────────

INSERT INTO customers (name, city, visit_count, last_visit) VALUES
('Ceren Yüksel',       'İstanbul',  18, CURRENT_DATE + INTERVAL '13 hours 50 mins'),
('Burak Yıldız',       'İstanbul',  14, CURRENT_DATE - INTERVAL  '1 day' + INTERVAL '20 hours'),
('Zeynep Arslan',      'İstanbul',  12, CURRENT_DATE + INTERVAL '12 hours 35 mins'),
('Tuğba Kılıç',       'İstanbul',  11, CURRENT_DATE - INTERVAL  '2 days' + INTERVAL '20 hours 15 mins'),
('Ahmet Yılmaz',       'İstanbul',   9, CURRENT_DATE + INTERVAL '13 hours 20 mins'),
('Deniz Avcı',        'İzmir',      8, CURRENT_DATE - INTERVAL  '1 day' + INTERVAL '19 hours 35 mins'),
('Gizem Aslan',        'İstanbul',   7, CURRENT_DATE - INTERVAL  '1 day' + INTERVAL '21 hours  5 mins'),
('Hasan Polat',        'İzmir',      7, CURRENT_DATE - INTERVAL  '3 days' + INTERVAL '19 hours 45 mins'),
('İrem Özkan',        'İstanbul',   7, CURRENT_DATE + INTERVAL '12 hours 55 mins'),
('Pınar Güler',       'İstanbul',   6, CURRENT_DATE - INTERVAL  '2 days' + INTERVAL '19 hours 30 mins'),
('Ayşe Çelik',        'İstanbul',   5, CURRENT_DATE + INTERVAL '12 hours 10 mins'),
('Mert Arslan',        'İstanbul',   4, CURRENT_DATE - INTERVAL  '1 day' + INTERVAL '20 hours 50 mins'),
('Emre Öztürk',       'İstanbul',   4, CURRENT_DATE - INTERVAL  '3 days' + INTERVAL '21 hours'),
('Elif Güneş',         'İstanbul',   4, CURRENT_DATE - INTERVAL  '2 days' + INTERVAL '20 hours 50 mins'),
('Başak Yılmaz',      'İzmir',      3, CURRENT_DATE - INTERVAL  '3 days' + INTERVAL '12 hours 30 mins'),
('Fatma Demir',        'Ankara',     3, CURRENT_DATE - INTERVAL  '4 days' + INTERVAL '13 hours 10 mins'),
('Oğuz Çetin',        'İzmir',      3, CURRENT_DATE - INTERVAL  '5 days' + INTERVAL '19 hours 35 mins'),
('Sercan Doğan',      'Ankara',     3, CURRENT_DATE - INTERVAL  '4 days' + INTERVAL '20 hours'),
('Ali Şahin',          'Bursa',      2, CURRENT_DATE - INTERVAL  '5 days' + INTERVAL '13 hours'),
('Merve Aydın',        'Ankara',     2, CURRENT_DATE - INTERVAL  '6 days' + INTERVAL '12 hours 45 mins'),
('Berk Güven',         'Bursa',      2, CURRENT_DATE - INTERVAL  '7 days' + INTERVAL '19 hours 20 mins'),
('Tolga Aksoy',        'Antalya',    2, CURRENT_DATE - INTERVAL  '6 days' + INTERVAL '20 hours'),
('Kenan Doğan',       'Bursa',      2, CURRENT_DATE - INTERVAL  '9 days' + INTERVAL '13 hours'),
('Volkan Polat',       'Kayseri',    2, CURRENT_DATE - INTERVAL '11 days' + INTERVAL '20 hours 15 mins'),
('Fatih Sarı',         'Eskişehir',  2, CURRENT_DATE - INTERVAL '12 days' + INTERVAL '12 hours 50 mins'),
('Özge Kaya',         'Ankara',     2, CURRENT_DATE - INTERVAL  '7 days' + INTERVAL '19 hours 40 mins'),
('Mustafa Erdoğan',   'Antalya',    1, CURRENT_DATE - INTERVAL  '7 days' + INTERVAL '12 hours 15 mins'),
('Mehmet Kaya',        'İzmir',      1, CURRENT_DATE - INTERVAL  '3 days' + INTERVAL '13 hours 20 mins'),
('Cem Taş',            'Ankara',     1, CURRENT_DATE - INTERVAL '20 days' + INTERVAL '12 hours 35 mins'),
('Selin Koç',          'Bursa',      1, CURRENT_DATE - INTERVAL '10 days' + INTERVAL '20 hours 30 mins'),
('Nur Yaman',          'İstanbul',   1, CURRENT_DATE - INTERVAL  '1 day' + INTERVAL '13 hours 50 mins'),
('Kerem Acar',         'İstanbul',   1, CURRENT_DATE - INTERVAL  '2 days' + INTERVAL '12 hours 20 mins'),
('Seda Özdemir',       'İzmir',      1, CURRENT_DATE - INTERVAL  '4 days' + INTERVAL '19 hours 10 mins'),
('Barış Çelik',       'İstanbul',   1, CURRENT_DATE - INTERVAL  '5 days' + INTERVAL '20 hours 40 mins'),
('Lale Kaya',          'Ankara',     1, CURRENT_DATE - INTERVAL  '6 days' + INTERVAL '13 hours'),
('Arda Demir',         'İstanbul',   1, CURRENT_DATE - INTERVAL  '7 days' + INTERVAL '19 hours 55 mins'),
('Melis Yıldız',      'Konya',      1, CURRENT_DATE - INTERVAL  '8 days' + INTERVAL '12 hours 40 mins'),
('Uğur Çetin',        'Gaziantep',  1, CURRENT_DATE - INTERVAL '14 days' + INTERVAL '20 hours'),
('Sibel Arslan',       'Trabzon',    1, CURRENT_DATE - INTERVAL '18 days' + INTERVAL '13 hours 25 mins'),
('Nihan Güler',        'Samsun',     1, CURRENT_DATE - INTERVAL '22 days' + INTERVAL '19 hours 30 mins'),
('Taner Özcan',        'Adana',      1, CURRENT_DATE - INTERVAL '16 days' + INTERVAL '12 hours 55 mins'),
('Aylin Şahin',       'Antalya',    1, CURRENT_DATE - INTERVAL '19 days' + INTERVAL '20 hours 20 mins');
