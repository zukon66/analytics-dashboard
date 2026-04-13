-- ============================================================
-- RPC Functions for Analytics Dashboard
-- ============================================================

-- get_platform_kpis
CREATE OR REPLACE FUNCTION get_platform_kpis()
RETURNS TABLE (
  totalbusinesses     BIGINT,
  activebusinesses    BIGINT,
  churnriskcount      BIGINT,
  totalscanstown      BIGINT,
  totalscansweek      BIGINT,
  totalrevenuealltime NUMERIC
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    (SELECT COUNT(*) FROM businesses)::BIGINT,
    (SELECT COUNT(*) FROM businesses WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM businesses
     WHERE last_active_at < NOW() - INTERVAL '14 days'
       AND status != 'churned')::BIGINT,
    (SELECT COUNT(*) FROM scans
     WHERE scanned_at >= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM scans
     WHERE scanned_at >= NOW() - INTERVAL '7 days')::BIGINT,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders
     WHERE status = 'completed')::NUMERIC;
$$;

-- get_businesses_list
CREATE OR REPLACE FUNCTION get_businesses_list(search_term TEXT DEFAULT '')
RETURNS SETOF businesses
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM businesses
  WHERE (
    search_term = ''
    OR name ILIKE '%' || search_term || '%'
    OR city ILIKE '%' || search_term || '%'
    OR owner_email ILIKE '%' || search_term || '%'
  )
  ORDER BY created_at DESC;
$$;

-- get_business_by_id
CREATE OR REPLACE FUNCTION get_business_by_id(business_id BIGINT)
RETURNS SETOF businesses
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM businesses WHERE id = business_id LIMIT 1;
$$;

-- get_churn_risk_businesses
CREATE OR REPLACE FUNCTION get_churn_risk_businesses(inactive_days INT DEFAULT 14)
RETURNS TABLE (
  id             BIGINT,
  name           TEXT,
  city           TEXT,
  plan           TEXT,
  status         TEXT,
  owner_email    TEXT,
  created_at     TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  days_since_active INT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    id, name, city, plan, status, owner_email, created_at, last_active_at,
    EXTRACT(DAY FROM NOW() - last_active_at)::INT AS days_since_active
  FROM businesses
  WHERE
    last_active_at < NOW() - make_interval(days => inactive_days)
    AND status != 'churned'
  ORDER BY last_active_at ASC;
$$;

-- RLS izinleri
GRANT EXECUTE ON FUNCTION get_platform_kpis()            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_businesses_list(TEXT)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_business_by_id(BIGINT)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_churn_risk_businesses(INT) TO anon, authenticated;
