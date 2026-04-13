-- ============================================================
-- KÖK-OS Internal Dashboard — Faz 1: Multi-tenant temeli
-- Initial schema'dan (20240101000000) sonra çalıştır
-- ============================================================

-- ── 1. businesses tablosu ────────────────────────────────────
CREATE TABLE IF NOT EXISTS businesses (
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

CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses (status);
CREATE INDEX IF NOT EXISTS idx_businesses_plan   ON businesses (plan);
CREATE INDEX IF NOT EXISTS idx_businesses_city   ON businesses (city);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_businesses" ON businesses;
CREATE POLICY "anon_read_businesses"
  ON businesses FOR SELECT TO anon USING (true);
-- TODO Faz 4: authenticated kullanıcıya göre kısıtlanacak

-- ── 2. business_id kolonları (nullable — mevcut data korunur) ─
ALTER TABLE scans     ADD COLUMN IF NOT EXISTS business_id BIGINT
  REFERENCES businesses(id) ON DELETE SET NULL;

ALTER TABLE orders    ADD COLUMN IF NOT EXISTS business_id BIGINT
  REFERENCES businesses(id) ON DELETE SET NULL;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_id BIGINT
  REFERENCES businesses(id) ON DELETE SET NULL;

-- ── 3. İndeksler ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scans_business_id     ON scans     (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id    ON orders    (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers (business_id);

-- Composite: business bazlı zaman sorgularında kullanılacak (Faz 2)
CREATE INDEX IF NOT EXISTS idx_scans_business_time  ON scans  (business_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_orders_business_time ON orders (business_id, created_at);
