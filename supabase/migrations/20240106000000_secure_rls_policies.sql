-- ============================================================
-- KÖK-OS Security — RLS Sıkılaştırma
-- Ham tablo erişimini kapat, SECURITY DEFINER RPC'leri açık bırak
-- ============================================================

-- ── scans: anon ham SELECT'i kaldır ─────────────────────────
DROP POLICY IF EXISTS "anon_read_scans"     ON scans;
DROP POLICY IF EXISTS "anon okuma"          ON scans;
DROP POLICY IF EXISTS "anon_read"           ON scans;

-- ── orders: anon ham SELECT'i kaldır ────────────────────────
DROP POLICY IF EXISTS "anon_read_orders"    ON orders;
DROP POLICY IF EXISTS "anon okuma"          ON orders;
DROP POLICY IF EXISTS "anon_read"           ON orders;

-- ── customers: anon ham SELECT'i kaldır ─────────────────────
DROP POLICY IF EXISTS "anon_read_customers" ON customers;
DROP POLICY IF EXISTS "anon okuma"          ON customers;
DROP POLICY IF EXISTS "anon_read"           ON customers;

-- ── businesses: anon ham SELECT'i kaldır ────────────────────
DROP POLICY IF EXISTS "anon_read_businesses" ON businesses;
DROP POLICY IF EXISTS "anon okuma"           ON businesses;
DROP POLICY IF EXISTS "anon_read"            ON businesses;

-- ── RPC fonksiyonlarının erişimi korunuyor ───────────────────
-- Tüm get_* fonksiyonları SECURITY DEFINER ile tanımlı.
-- Anon key sadece bu fonksiyonları çağırabilir,
-- direkt tablo sorgusu yapamaz.
--
-- Mevcut GRANT'lar (değiştirilmiyor):
--   GRANT EXECUTE ON FUNCTION get_platform_kpis()          TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_mrr_trend()              TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_current_mrr()            TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_trial_expirations(INT)   TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_new_registrations(INT)   TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_activation_funnel()      TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_platform_averages(TEXT)  TO anon, authenticated;
--   GRANT EXECUTE ON FUNCTION get_customer_growth_trend(TEXT) TO anon, authenticated;

-- ── INSERT / UPDATE koruması (zaten vardı, teyit) ────────────
-- Sadece authenticated kullanıcılar yazabilir.
-- Bu politikalar değiştirilmiyor.
