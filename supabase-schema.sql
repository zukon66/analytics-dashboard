-- ================================================================
-- KÖK-OS Internal Operator Dashboard — Master Schema
-- Supabase SQL Editor'da sıfırdan kurmak için çalıştır
-- ================================================================


-- ── 1. BUSINESSES TABLOSU (platform müşterileri / işletmeler) ──
CREATE TABLE IF NOT EXISTS public.businesses (
  id             BIGSERIAL    PRIMARY KEY,
  name           TEXT         NOT NULL,
  city           TEXT         NOT NULL DEFAULT 'İstanbul',
  plan           TEXT         NOT NULL DEFAULT 'trial'
                   CHECK (plan IN ('trial', 'starter', 'pro', 'enterprise')),
  status         TEXT         NOT NULL DEFAULT 'trial'
                   CHECK (status IN ('active', 'inactive', 'churned', 'trial')),
  owner_email    TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses (status);
CREATE INDEX IF NOT EXISTS idx_businesses_plan   ON public.businesses (plan);
CREATE INDEX IF NOT EXISTS idx_businesses_city   ON public.businesses (city);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "businesses: anon okuma"
  ON public.businesses FOR SELECT USING (true);
-- TODO Faz 4: authenticated role bazlı kısıtlama


-- ── 2. SCANS TABLOSU (QR kod taramaları) ──────────────────────
CREATE TABLE IF NOT EXISTS public.scans (
  id               BIGSERIAL    PRIMARY KEY,
  business_id      BIGINT       REFERENCES public.businesses(id) ON DELETE SET NULL,
  table_id         TEXT         NOT NULL,
  zone             TEXT         NOT NULL,
  city             TEXT         NOT NULL DEFAULT 'İstanbul',
  scanned_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  duration_minutes INT          DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scans_business_id    ON public.scans (business_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at     ON public.scans (scanned_at);
CREATE INDEX IF NOT EXISTS idx_scans_zone           ON public.scans (zone);
CREATE INDEX IF NOT EXISTS idx_scans_business_time  ON public.scans (business_id, scanned_at);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scans: anon okuma"
  ON public.scans FOR SELECT USING (true);
CREATE POLICY "scans: yetkili ekleme"
  ON public.scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ── 3. ORDERS TABLOSU (siparişler) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id           BIGSERIAL     PRIMARY KEY,
  business_id  BIGINT        REFERENCES public.businesses(id) ON DELETE SET NULL,
  table_id     TEXT          NOT NULL,
  zone         TEXT          NOT NULL,
  total_amount NUMERIC(10,2) DEFAULT 0,
  status       TEXT          NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_business_id   ON public.orders (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_business_time ON public.orders (business_id, created_at);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders: anon okuma"
  ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders: yetkili ekleme"
  ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ── 4. CUSTOMERS TABLOSU (son kullanıcı ziyaretçiler) ─────────
-- NOT: Bu tablo restoran müşterilerini (son kullanıcı) tutar.
-- Platform müşterileri (işletmeler) için businesses tablosunu kullan.
CREATE TABLE IF NOT EXISTS public.customers (
  id          BIGSERIAL    PRIMARY KEY,
  business_id BIGINT       REFERENCES public.businesses(id) ON DELETE SET NULL,
  name        TEXT         NOT NULL,
  city        TEXT         NOT NULL DEFAULT 'İstanbul',
  visit_count INT          NOT NULL DEFAULT 1,
  last_visit  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_business_id  ON public.customers (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_visit_count  ON public.customers (visit_count DESC);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers: anon okuma"
  ON public.customers FOR SELECT USING (true);
CREATE POLICY "customers: yetkili ekleme"
  ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ── 5. GRANT — anon rolü okuma izinleri ───────────────────────
-- RLS politikaları satır filtrelemesi yapar; GRANT tablo erişimini açar.
-- İkisi birlikte gerekli.
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.businesses TO anon;
GRANT SELECT ON public.scans      TO anon;
GRANT SELECT ON public.orders     TO anon;
GRANT SELECT ON public.customers  TO anon;
