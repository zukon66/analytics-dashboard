-- ================================================================
-- Analytics Dashboard: Supabase Schema
-- Supabase SQL Editor'da çalıştır
-- ================================================================


-- ───────────────────────────────────────────────
-- 1. SCANS TABLOSU (QR kod taramaları)
-- ───────────────────────────────────────────────
create table if not exists public.scans (
  id               bigserial    primary key,
  table_id         text         not null,
  zone             text         not null,
  city             text         not null default 'Istanbul',
  scanned_at       timestamptz  not null default now(),
  duration_minutes int          default 0
);

create index if not exists idx_scans_scanned_at on public.scans (scanned_at);
create index if not exists idx_scans_zone        on public.scans (zone);

alter table public.scans enable row level security;
create policy "scans: anonim okuma"  on public.scans for select using (true);
create policy "scans: yetkili ekleme" on public.scans for insert with check (auth.role() = 'authenticated');

-- Test verisi (200 tarama, bugün)
insert into public.scans (table_id, zone, city, scanned_at, duration_minutes)
select
  'T-' || lpad((floor(random() * 12 + 1))::text, 2, '0'),
  (array['Terrace', 'Indoor', 'Bar', 'Garden'])[floor(random() * 4 + 1)],
  (array['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'])[floor(random() * 5 + 1)],
  now() - (random() * interval '20 hours'),
  floor(random() * 90 + 10)::int
from generate_series(1, 200);


-- ───────────────────────────────────────────────
-- 2. ORDERS TABLOSU (Siparişler)
-- ───────────────────────────────────────────────
create table if not exists public.orders (
  id           bigserial    primary key,
  table_id     text         not null,
  zone         text         not null,
  total_amount numeric(10,2) default 0,
  status       text         not null default 'pending'
                            check (status in ('completed', 'pending', 'cancelled')),
  created_at   timestamptz  not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at);

alter table public.orders enable row level security;
create policy "orders: anonim okuma"    on public.orders for select using (true);
create policy "orders: yetkili ekleme"  on public.orders for insert with check (auth.role() = 'authenticated');

-- Test verisi (50 sipariş)
insert into public.orders (table_id, zone, total_amount, status, created_at)
select
  'T-' || lpad((floor(random() * 12 + 1))::text, 2, '0'),
  (array['Terrace', 'Indoor', 'Bar', 'Garden'])[floor(random() * 4 + 1)],
  round((random() * 800 + 50)::numeric, 2),
  (array['completed', 'completed', 'completed', 'pending', 'cancelled'])[floor(random() * 5 + 1)],
  now() - (random() * interval '3 days')
from generate_series(1, 50);


-- ───────────────────────────────────────────────
-- 3. CUSTOMERS TABLOSU (Müşteriler)
-- ───────────────────────────────────────────────
create table if not exists public.customers (
  id          bigserial    primary key,
  name        text         not null,
  city        text         not null default 'Istanbul',
  visit_count int          not null default 1,
  last_visit  timestamptz  not null default now()
);

create index if not exists idx_customers_visit_count on public.customers (visit_count desc);

alter table public.customers enable row level security;
create policy "customers: anonim okuma"   on public.customers for select using (true);
create policy "customers: yetkili ekleme" on public.customers for insert with check (auth.role() = 'authenticated');

-- Test verisi (30 müşteri)
insert into public.customers (name, city, visit_count, last_visit)
values
  ('Ahmet Yılmaz',    'Istanbul',  8,  now() - interval '1 day'),
  ('Fatma Kaya',      'Ankara',    5,  now() - interval '2 days'),
  ('Mehmet Demir',    'Izmir',     12, now() - interval '3 hours'),
  ('Ayşe Çelik',      'Istanbul',  3,  now() - interval '4 days'),
  ('Ali Şahin',       'Bursa',     1,  now() - interval '1 day'),
  ('Zeynep Arslan',   'Istanbul',  7,  now() - interval '6 hours'),
  ('Mustafa Öztürk',  'Antalya',   2,  now() - interval '2 days'),
  ('Elif Yıldız',     'Istanbul',  15, now() - interval '1 hour'),
  ('Hasan Koç',       'Ankara',    4,  now() - interval '3 days'),
  ('Merve Aydın',     'Izmir',     9,  now() - interval '5 hours'),
  ('İbrahim Güneş',   'Istanbul',  1,  now() - interval '12 hours'),
  ('Selin Polat',     'Bursa',     6,  now() - interval '2 days'),
  ('Emre Doğan',      'Istanbul',  11, now() - interval '30 minutes'),
  ('Büşra Çetin',     'Ankara',    2,  now() - interval '1 day'),
  ('Oğuz Kılıç',      'Antalya',   3,  now() - interval '4 days'),
  ('Gül Erdoğan',     'Istanbul',  18, now() - interval '2 hours'),
  ('Serkan Avcı',     'Izmir',     5,  now() - interval '1 day'),
  ('Hatice Yurt',     'Istanbul',  1,  now() - interval '5 hours'),
  ('Tarık Bozkurt',   'Ankara',    7,  now() - interval '3 days'),
  ('Ceren Uslu',      'Istanbul',  4,  now() - interval '8 hours'),
  ('Berk Sönmez',     'Bursa',     2,  now() - interval '2 days'),
  ('Nalan Güler',     'Istanbul',  10, now() - interval '45 minutes'),
  ('Kemal Taş',       'Izmir',     3,  now() - interval '1 day'),
  ('Pınar Altın',     'Istanbul',  6,  now() - interval '6 hours'),
  ('Volkan Özer',     'Antalya',   1,  now() - interval '3 days'),
  ('Deniz Karaca',    'Istanbul',  14, now() - interval '1 hour'),
  ('Tuba Yıldırım',   'Ankara',    5,  now() - interval '2 days'),
  ('Mert Aslan',      'Istanbul',  8,  now() - interval '4 hours'),
  ('Rüya Çakır',      'Izmir',     2,  now() - interval '1 day'),
  ('Cem Karadeniz',   'Istanbul',  20, now() - interval '20 minutes');
