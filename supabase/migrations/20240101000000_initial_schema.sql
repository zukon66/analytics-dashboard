-- ============================================================
-- KÖK-OS Analytics Dashboard — Initial Schema
-- ============================================================

-- ── scans ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id               BIGSERIAL PRIMARY KEY,
  table_id         TEXT        NOT NULL,
  zone             TEXT        NOT NULL,
  city             TEXT        NOT NULL,
  scanned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scans_scanned_at  ON scans (scanned_at);
CREATE INDEX IF NOT EXISTS idx_scans_zone        ON scans (zone);
CREATE INDEX IF NOT EXISTS idx_scans_city        ON scans (city);
CREATE INDEX IF NOT EXISTS idx_scans_table_id    ON scans (table_id);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_scans" ON scans;
CREATE POLICY "anon_read_scans"
  ON scans FOR SELECT
  TO anon
  USING (true);

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           BIGSERIAL PRIMARY KEY,
  table_id     TEXT           NOT NULL,
  zone         TEXT           NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status       TEXT           NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id   ON orders (table_id);
CREATE INDEX IF NOT EXISTS idx_orders_zone       ON orders (zone);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_orders" ON orders;
CREATE POLICY "anon_read_orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

-- ── customers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  visit_count INTEGER     NOT NULL DEFAULT 1,
  last_visit  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_city        ON customers (city);
CREATE INDEX IF NOT EXISTS idx_customers_visit_count ON customers (visit_count);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit  ON customers (last_visit);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_customers" ON customers;
CREATE POLICY "anon_read_customers"
  ON customers FOR SELECT
  TO anon
  USING (true);
