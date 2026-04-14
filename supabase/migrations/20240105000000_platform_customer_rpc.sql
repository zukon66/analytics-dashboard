-- ============================================================
-- KÖK-OS Analytics — Platform Karşılaştırma & Müşteri Büyüme RPC
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. get_platform_averages
--    Aktif işletmelerin seçili periyottaki ortalama tarama/gelir/müşteri
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_platform_averages(period_key TEXT DEFAULT '7d')
RETURNS TABLE (
  avg_scans     NUMERIC,
  avg_revenue   NUMERIC,
  avg_customers NUMERIC
)
LANGUAGE sql SECURITY DEFINER AS $$
  WITH period_bounds AS (
    SELECT
      CASE period_key
        WHEN 'today' THEN CURRENT_DATE::TIMESTAMPTZ
        WHEN '7d'    THEN NOW() - INTERVAL '7 days'
        WHEN '30d'   THEN NOW() - INTERVAL '30 days'
        ELSE CURRENT_DATE::TIMESTAMPTZ
      END AS from_ts,
      NOW() AS to_ts
  ),
  active_biz AS (
    SELECT id FROM businesses WHERE status = 'active'
  ),
  scan_counts AS (
    SELECT s.business_id, COUNT(*) AS cnt
    FROM scans s, period_bounds p
    WHERE s.scanned_at BETWEEN p.from_ts AND p.to_ts
      AND s.business_id IN (SELECT id FROM active_biz)
    GROUP BY s.business_id
  ),
  revenue_counts AS (
    SELECT o.business_id, COALESCE(SUM(o.total_amount), 0) AS total
    FROM orders o, period_bounds p
    WHERE o.created_at BETWEEN p.from_ts AND p.to_ts
      AND o.status = 'completed'
      AND o.business_id IN (SELECT id FROM active_biz)
    GROUP BY o.business_id
  ),
  customer_counts AS (
    SELECT c.business_id, COUNT(*) AS cnt
    FROM customers c, period_bounds p
    WHERE c.last_visit BETWEEN p.from_ts AND p.to_ts
      AND c.business_id IN (SELECT id FROM active_biz)
    GROUP BY c.business_id
  )
  SELECT
    COALESCE(AVG(sc.cnt),    0)::NUMERIC AS avg_scans,
    COALESCE(AVG(rc.total),  0)::NUMERIC AS avg_revenue,
    COALESCE(AVG(cc.cnt),    0)::NUMERIC AS avg_customers
  FROM active_biz ab
  LEFT JOIN scan_counts     sc ON sc.business_id = ab.id
  LEFT JOIN revenue_counts  rc ON rc.business_id = ab.id
  LEFT JOIN customer_counts cc ON cc.business_id = ab.id;
$$;

-- ──────────────────────────────────────────────────────────────
-- 2. get_customer_growth_trend
--    Haftalık (son 8 hafta) veya aylık (son 6 ay) müşteri aktivitesi
--    last_visit kullanılır (customers tablosunda created_at yok)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_customer_growth_trend(granularity TEXT DEFAULT 'weekly')
RETURNS TABLE (
  period_label  TEXT,
  period_start  TIMESTAMPTZ,
  new_customers BIGINT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    CASE granularity
      WHEN 'monthly' THEN TO_CHAR(DATE_TRUNC('month', last_visit), 'Mon YYYY')
      ELSE                TO_CHAR(DATE_TRUNC('week',  last_visit), 'DD Mon')
    END AS period_label,
    CASE granularity
      WHEN 'monthly' THEN DATE_TRUNC('month', last_visit)
      ELSE                DATE_TRUNC('week',  last_visit)
    END AS period_start,
    COUNT(*)::BIGINT AS new_customers
  FROM customers
  WHERE last_visit >= CASE granularity
    WHEN 'monthly' THEN DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
    ELSE                DATE_TRUNC('week',  NOW()) - INTERVAL '7 weeks'
  END
  GROUP BY 1, 2
  ORDER BY 2 ASC;
$$;

-- ── RLS izinleri ──────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION get_platform_averages(TEXT)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_customer_growth_trend(TEXT)    TO anon, authenticated;
