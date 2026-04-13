-- ============================================================
-- KÖK-OS Growth Dashboard — Büyüme Paneli RPC Fonksiyonları
-- ============================================================

-- ── Destekleyici indexler ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_created_at
  ON businesses (created_at);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders (created_at);

-- ──────────────────────────────────────────────────────────────
-- 1. get_mrr_trend
--    Son 12 ayın aylık toplam sipariş geliri (tamamlanan siparişler)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_mrr_trend()
RETURNS TABLE (
  month_label  TEXT,
  month_start  TIMESTAMPTZ,
  revenue      NUMERIC
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'MM-YYYY') AS month_label,
    DATE_TRUNC('month', created_at)                      AS month_start,
    COALESCE(SUM(total_amount), 0)                       AS revenue
  FROM orders
  WHERE
    status = 'completed'
    AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
  GROUP BY DATE_TRUNC('month', created_at)
  ORDER BY DATE_TRUNC('month', created_at) ASC;
$$;

-- ──────────────────────────────────────────────────────────────
-- 2. get_current_mrr
--    Plan bazlı anlık MRR (enterprise=2499₺, pro=999₺, starter=499₺)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_current_mrr()
RETURNS TABLE (
  plan           TEXT,
  business_count BIGINT,
  plan_fee       NUMERIC,
  plan_mrr       NUMERIC
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    plan,
    COUNT(*)::BIGINT AS business_count,
    CASE plan
      WHEN 'enterprise' THEN 2499
      WHEN 'pro'        THEN 999
      WHEN 'starter'    THEN 499
      ELSE 0
    END::NUMERIC AS plan_fee,
    COUNT(*) * CASE plan
      WHEN 'enterprise' THEN 2499
      WHEN 'pro'        THEN 999
      WHEN 'starter'    THEN 499
      ELSE 0
    END::NUMERIC AS plan_mrr
  FROM businesses
  WHERE status IN ('active', 'trial', 'inactive')
  GROUP BY plan
  ORDER BY plan_mrr DESC;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. get_trial_expirations
--    Trial süresi warning_days içinde bitecek işletmeler
--    Trial süresi = created_at + 14 gün
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_trial_expirations(warning_days INT DEFAULT 14)
RETURNS TABLE (
  id             BIGINT,
  name           TEXT,
  city           TEXT,
  owner_email    TEXT,
  created_at     TIMESTAMPTZ,
  trial_ends_at  TIMESTAMPTZ,
  days_remaining INT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    id,
    name,
    city,
    owner_email,
    created_at,
    (created_at + INTERVAL '14 days') AS trial_ends_at,
    GREATEST(
      0,
      EXTRACT(DAY FROM (created_at + INTERVAL '14 days') - NOW())::INT
    ) AS days_remaining
  FROM businesses
  WHERE
    plan = 'trial'
    AND status != 'churned'
    AND (created_at + INTERVAL '14 days') >= NOW()
    AND (created_at + INTERVAL '14 days') <= NOW() + make_interval(days => warning_days)
  ORDER BY (created_at + INTERVAL '14 days') ASC;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. get_new_registrations
--    Son lookback_days gün içinde kayıt olan işletmeler
--    + ilk scan var mı bilgisi
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_new_registrations(lookback_days INT DEFAULT 30)
RETURNS TABLE (
  id             BIGINT,
  name           TEXT,
  city           TEXT,
  plan           TEXT,
  owner_email    TEXT,
  created_at     TIMESTAMPTZ,
  has_first_scan BOOLEAN
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    b.id,
    b.name,
    b.city,
    b.plan,
    b.owner_email,
    b.created_at,
    EXISTS (
      SELECT 1 FROM scans s
      WHERE s.business_id = b.id
      LIMIT 1
    ) AS has_first_scan
  FROM businesses b
  WHERE b.created_at >= NOW() - make_interval(days => lookback_days)
  ORDER BY b.created_at DESC;
$$;

-- ──────────────────────────────────────────────────────────────
-- 5. get_activation_funnel
--    Aktivasyon hunisi: toplam kayıt → 1+ scan → 10+ scan
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_activation_funnel()
RETURNS TABLE (
  total_businesses    BIGINT,
  activated_1plus     BIGINT,
  power_users_10plus  BIGINT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    (SELECT COUNT(*) FROM businesses)::BIGINT AS total_businesses,
    (SELECT COUNT(DISTINCT business_id)
     FROM scans
     WHERE business_id IS NOT NULL)::BIGINT AS activated_1plus,
    (SELECT COUNT(*) FROM (
       SELECT business_id
       FROM scans
       WHERE business_id IS NOT NULL
       GROUP BY business_id
       HAVING COUNT(*) >= 10
     ) sub)::BIGINT AS power_users_10plus;
$$;

-- ── RLS izinleri ──────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION get_mrr_trend()                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_current_mrr()                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trial_expirations(INT)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_new_registrations(INT)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_activation_funnel()           TO anon, authenticated;
