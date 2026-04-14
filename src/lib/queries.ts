import { supabase } from "./supabase";

// ─── HELPERS ──────────────────────────────────────────────────

function getPeriodRange(period: string): { from: string; to: string } {
  const now = new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return { from: `${period}T00:00:00`, to: `${period}T23:59:59` };
  }
  if (period === "7d") {
    return { from: new Date(Date.now() - 7 * 86400000).toISOString(), to: now.toISOString() };
  }
  if (period === "30d") {
    return { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: now.toISOString() };
  }
  const today = now.toISOString().split("T")[0];
  return { from: `${today}T00:00:00`, to: `${today}T23:59:59` };
}

// businessId filtresi — tüm sorgularda ortak pattern
function applyBusinessFilter<T extends { eq: (col: string, val: number) => T }>(
  query: T,
  businessId?: number
): T {
  return businessId ? query.eq("business_id", businessId) : query;
}

export type QueryResult<T> = { data: T; error: string | null };

// ─── BUSINESSES (platform seviyesi) ───────────────────────────

export type Business = {
  id: number;
  name: string;
  city: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  status: "active" | "inactive" | "churned" | "trial";
  owner_email: string | null;
  created_at: string;
  last_active_at: string | null;
};

export async function getBusinesses(search = ""): Promise<QueryResult<Business[]>> {
  try {
    const { data, error } = await supabase.rpc("get_businesses_list", { search_term: search });
    if (error) throw error;
    return { data: (data as Business[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getBusinessById(id: number): Promise<QueryResult<Business | null>> {
  try {
    const { data, error } = await supabase.rpc("get_business_by_id", { business_id: id });
    if (error) throw error;
    const rows = data as Business[];
    return { data: rows?.[0] ?? null, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

// ─── PLATFORM OVERVIEW KPIs ───────────────────────────────────

export async function getPlatformKPIs(): Promise<
  QueryResult<{
    totalBusinesses: number;
    activeBusinesses: number;
    churnRiskCount: number;
    totalScansToday: number;
    totalScansWeek: number;
    totalRevenueAllTime: number;
  }>
> {
  try {
    const { data, error } = await supabase.rpc("get_platform_kpis");
    if (error) throw error;
    const rows = data as Array<{
      totalbusinesses: number; activebusinesses: number; churnriskcount: number;
      totalscanstown: number; totalscansweek: number; totalrevenuealltime: number;
    }>;
    const d = rows?.[0] ?? {} as typeof rows[0];
    return {
      data: {
        totalBusinesses:    d.totalbusinesses    ?? 0,
        activeBusinesses:   d.activebusinesses   ?? 0,
        churnRiskCount:     d.churnriskcount     ?? 0,
        totalScansToday:    d.totalscanstown     ?? 0,
        totalScansWeek:     d.totalscansweek     ?? 0,
        totalRevenueAllTime: d.totalrevenuealltime ?? 0,
      },
      error: null,
    };
  } catch (e) {
    return {
      data: { totalBusinesses: 0, activeBusinesses: 0, churnRiskCount: 0, totalScansToday: 0, totalScansWeek: 0, totalRevenueAllTime: 0 },
      error: String(e),
    };
  }
}

export async function getChurnRiskBusinesses(inactiveDays = 14): Promise<
  QueryResult<Array<Business & { daysSinceActive: number }>>
> {
  try {
    const { data, error } = await supabase.rpc("get_churn_risk_businesses", { inactive_days: inactiveDays });
    if (error) throw error;
    return {
      data: (data ?? []).map((b: Business & { days_since_active: number }) => ({
        ...b,
        daysSinceActive: b.days_since_active ?? 999,
      })),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

// İşletme bazlı haftalık scan özeti — businesses listesinde kullanılır
export async function getBusinessScanCounts(
  businessIds: number[],
  days = 7
): Promise<Record<number, number>> {
  if (businessIds.length === 0) return {};
  const from = new Date(Date.now() - days * 86400000).toISOString();
  try {
    const { data } = await supabase
      .from("scans")
      .select("business_id")
      .in("business_id", businessIds)
      .gte("scanned_at", from);
    const counts: Record<number, number> = {};
    data?.forEach((row) => {
      counts[row.business_id] = (counts[row.business_id] ?? 0) + 1;
    });
    return counts;
  } catch {
    return {};
  }
}

// ─── SCANS ────────────────────────────────────────────────────

export async function getScansByHour(
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ hour: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = supabase.from("scans").select("scanned_at").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    data?.forEach((row) => {
      const hour = new Date(row.scanned_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    return {
      data: Object.entries(hourMap).map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        scans: count,
      })),
      error: null,
    };
  } catch (e) {
    return {
      data: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, scans: 0 })),
      error: String(e),
    };
  }
}

export async function getScansByCity(
  period = "7d",
  businessId?: number
): Promise<QueryResult<Array<{ city: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = supabase.from("scans").select("city").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const cityMap: Record<string, number> = {};
    data?.forEach((row) => { cityMap[row.city] = (cityMap[row.city] || 0) + 1; });
    return {
      data: Object.entries(cityMap)
        .map(([city, scans]) => ({ city, scans }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 8),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getScansByPlan(
  period = "7d"
): Promise<QueryResult<Array<{ zone: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("business_id, businesses!inner(plan)")
      .gte("scanned_at", from)
      .lte("scanned_at", to);
    if (error) throw error;

    const planMap: Record<string, number> = {
      enterprise: 0, pro: 0, starter: 0, trial: 0,
    };
    data?.forEach((row) => {
      const plan = (row.businesses as unknown as { plan: string } | null)?.plan ?? "trial";
      planMap[plan] = (planMap[plan] || 0) + 1;
    });

    const PLAN_LABELS: Record<string, string> = {
      enterprise: "Enterprise",
      pro: "Pro",
      starter: "Starter",
      trial: "Deneme",
    };

    return {
      data: Object.entries(planMap)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([plan, scans]) => ({ zone: PLAN_LABELS[plan] ?? plan, scans })),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getScansByZone(
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ zone: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = supabase.from("scans").select("zone").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const zoneMap: Record<string, number> = {};
    data?.forEach((row) => { zoneMap[row.zone] = (zoneMap[row.zone] || 0) + 1; });
    return { data: Object.entries(zoneMap).map(([zone, scans]) => ({ zone, scans })), error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getTopTables(
  limit = 10,
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ tableId: string; zone: string; scans: number; avgDuration: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = supabase
      .from("scans")
      .select("table_id, zone, duration_minutes")
      .gte("scanned_at", from)
      .lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const tableMap: Record<string, { zone: string; scans: number; totalDuration: number }> = {};
    data?.forEach((row) => {
      if (!tableMap[row.table_id]) tableMap[row.table_id] = { zone: row.zone, scans: 0, totalDuration: 0 };
      tableMap[row.table_id].scans += 1;
      tableMap[row.table_id].totalDuration += row.duration_minutes ?? 0;
    });
    return {
      data: Object.entries(tableMap)
        .map(([tableId, stats]) => ({
          tableId,
          zone: stats.zone,
          scans: stats.scans,
          avgDuration: Math.round(stats.totalDuration / stats.scans),
        }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, limit),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getPeriodKPIs(
  period = "today",
  businessId?: number
): Promise<QueryResult<{ totalScans: number; peakHour: string; activeCities: number; activeZones: number }>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = supabase.from("scans").select("scanned_at, city, zone").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const totalScans = data?.length ?? 0;
    const hourMap: Record<number, number> = {};
    data?.forEach((row) => {
      const h = new Date(row.scanned_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const peakEntry = Object.entries(hourMap).reduce(
      (max, [h, c]) => (c > max[1] ? [h, c] : max),
      ["0", 0] as [string, number]
    );
    const peakHour = totalScans > 0 ? `${String(peakEntry[0]).padStart(2, "0")}:00` : "--";
    return {
      data: {
        totalScans,
        peakHour,
        activeCities: new Set(data?.map((r) => r.city)).size,
        activeZones: new Set(data?.map((r) => r.zone)).size,
      },
      error: null,
    };
  } catch (e) {
    return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
  }
}

export async function getComparisonKPIs(
  period = "today",
  businessId?: number
): Promise<QueryResult<{ totalScans: number; peakHour: string; activeCities: number; activeZones: number }>> {
  let prevPeriod: string;

  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    // belirli gün → bir önceki gün
    const d = new Date(period);
    d.setDate(d.getDate() - 1);
    prevPeriod = d.toISOString().split("T")[0];
  } else if (period === "7d") {
    // son 7 gün → önceki 7 gün (14-7 gün arası)
    const now = new Date();
    const prevTo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const prevFrom = new Date(now.getTime() - 14 * 86400000).toISOString();
    try {
      let query = supabase.from("scans").select("scanned_at, city, zone").gte("scanned_at", prevFrom).lte("scanned_at", prevTo);
      query = applyBusinessFilter(query, businessId);
      const { data, error } = await query;
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      return {
        data: {
          totalScans,
          peakHour: "--",
          activeCities: new Set(data?.map((r) => r.city)).size,
          activeZones: new Set(data?.map((r) => r.zone)).size,
        },
        error: null,
      };
    } catch (e) {
      return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
    }
  } else if (period === "30d") {
    // son 30 gün → önceki 30 gün
    const now = new Date();
    const prevTo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const prevFrom = new Date(now.getTime() - 60 * 86400000).toISOString();
    try {
      let query = supabase.from("scans").select("scanned_at, city, zone").gte("scanned_at", prevFrom).lte("scanned_at", prevTo);
      query = applyBusinessFilter(query, businessId);
      const { data, error } = await query;
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      return {
        data: {
          totalScans,
          peakHour: "--",
          activeCities: new Set(data?.map((r) => r.city)).size,
          activeZones: new Set(data?.map((r) => r.zone)).size,
        },
        error: null,
      };
    } catch (e) {
      return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
    }
  } else {
    // today → dün
    prevPeriod = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  }

  return getPeriodKPIs(prevPeriod, businessId);
}

export async function getWeeklyStats(
  businessId?: number
): Promise<QueryResult<{ total: number; avgPerDay: number; bestDay: string; dailyData: Array<{ day: string; scans: number }> }>> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  try {
    let query = supabase.from("scans").select("scanned_at").gte("scanned_at", weekAgo);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length ?? 0;
    const dayMap: Record<string, number> = {};
    data?.forEach((row) => {
      const day = new Date(row.scanned_at).toLocaleDateString("tr-TR", { weekday: "short" });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const dailyData = Object.entries(dayMap).map(([day, scans]) => ({ day, scans }));
    const bestDay = dailyData.reduce(
      (max, d) => (d.scans > max.scans ? d : max),
      dailyData[0] ?? { day: "--", scans: 0 }
    );
    return { data: { total, avgPerDay: Math.round(total / 7), bestDay: bestDay.day, dailyData }, error: null };
  } catch (e) {
    return { data: { total: 0, avgPerDay: 0, bestDay: "--", dailyData: [] }, error: String(e) };
  }
}

// ─── ORDERS ───────────────────────────────────────────────────

export type Order = {
  id: number;
  table_id: string;
  zone: string;
  total_amount: number;
  status: "completed" | "pending" | "cancelled";
  created_at: string;
};

const VALID_ORDER_SORT_COLS = ["id", "table_id", "total_amount", "created_at", "zone", "status"] as const;
type OrderSortCol = (typeof VALID_ORDER_SORT_COLS)[number];

export async function getOrders(
  limit = 50,
  sortBy = "created_at",
  sortDir: "asc" | "desc" = "desc",
  search = "",
  businessId?: number
): Promise<QueryResult<Order[]>> {
  const col: OrderSortCol = (VALID_ORDER_SORT_COLS as readonly string[]).includes(sortBy)
    ? (sortBy as OrderSortCol)
    : "created_at";
  try {
    let query = supabase
      .from("orders")
      .select("id, table_id, zone, total_amount, status, created_at")
      .order(col, { ascending: sortDir === "asc" })
      .limit(limit);
    if (search) query = query.or(`table_id.ilike.%${search}%,zone.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data as Order[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getOrderStats(
  businessId?: number
): Promise<QueryResult<{ totalRevenue: number; completed: number; pending: number; cancelled: number; avgAmount: number; cancelRate: number }>> {
  try {
    let query = supabase.from("orders").select("total_amount, status");
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const totalRevenue = data?.reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0;
    const completed = data?.filter((o) => o.status === "completed").length ?? 0;
    const pending = data?.filter((o) => o.status === "pending").length ?? 0;
    const cancelled = data?.filter((o) => o.status === "cancelled").length ?? 0;
    const total = data?.length ?? 0;
    return {
      data: {
        totalRevenue,
        completed,
        pending,
        cancelled,
        avgAmount: total > 0 ? Math.round(totalRevenue / total) : 0,
        cancelRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      },
      error: null,
    };
  } catch (e) {
    return { data: { totalRevenue: 0, completed: 0, pending: 0, cancelled: 0, avgAmount: 0, cancelRate: 0 }, error: String(e) };
  }
}

export async function getConversionRate(
  businessId?: number
): Promise<QueryResult<{ scanCount: number; orderCount: number; rate: number }>> {
  try {
    let scansQuery = supabase.from("scans").select("id", { count: "exact", head: true });
    let ordersQuery = supabase.from("orders").select("id", { count: "exact", head: true });
    scansQuery = applyBusinessFilter(scansQuery, businessId);
    ordersQuery = applyBusinessFilter(ordersQuery, businessId);

    const [scansRes, ordersRes] = await Promise.all([scansQuery, ordersQuery]);
    if (scansRes.error) throw scansRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const scanCount = scansRes.count ?? 0;
    const orderCount = ordersRes.count ?? 0;
    const rate = scanCount > 0 ? Math.round((orderCount / scanCount) * 100) : 0;
    return { data: { scanCount, orderCount, rate }, error: null };
  } catch (e) {
    return { data: { scanCount: 0, orderCount: 0, rate: 0 }, error: String(e) };
  }
}

// ─── CUSTOMERS ────────────────────────────────────────────────

export type Customer = {
  id: number;
  name: string;
  city: string;
  visit_count: number;
  last_visit: string;
};

export async function getCustomers(
  limit = 20,
  offset = 0,
  search = "",
  businessId?: number
): Promise<QueryResult<Customer[]>> {
  try {
    let query = supabase
      .from("customers")
      .select("id, name, city, visit_count, last_visit")
      .order("visit_count", { ascending: false })
      .range(offset, offset + limit - 1);
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data as Customer[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getCustomerStats(
  businessId?: number
): Promise<QueryResult<{ total: number; returning: number; newThisWeek: number }>> {
  try {
    let query = supabase.from("customers").select("visit_count, last_visit");
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length ?? 0;
    const returning = data?.filter((c) => c.visit_count > 1).length ?? 0;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const newThisWeek = data?.filter((c) => new Date(c.last_visit) >= new Date(weekAgo)).length ?? 0;
    return { data: { total, returning, newThisWeek }, error: null };
  } catch (e) {
    return { data: { total: 0, returning: 0, newThisWeek: 0 }, error: String(e) };
  }
}

export async function getCustomerCount(search = "", businessId?: number): Promise<number> {
  try {
    let query = supabase.from("customers").select("id", { count: "exact", head: true });
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ─── GROWTH ───────────────────────────────────────────────────

export type MrrTrendPoint = {
  month_label: string;
  month_start: string;
  revenue: number;
};

export type MrrPlanBreakdown = {
  plan: string;
  business_count: number;
  plan_fee: number;
  plan_mrr: number;
};

export type TrialExpiration = {
  id: number;
  name: string;
  city: string;
  owner_email: string | null;
  created_at: string;
  trial_ends_at: string;
  days_remaining: number;
};

export type NewRegistration = {
  id: number;
  name: string;
  city: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  owner_email: string | null;
  created_at: string;
  has_first_scan: boolean;
};

export type ActivationFunnel = {
  totalBusinesses: number;
  activated1Plus: number;
  powerUsers10Plus: number;
};

export async function getMrrTrend(): Promise<QueryResult<MrrTrendPoint[]>> {
  try {
    const { data, error } = await supabase.rpc("get_mrr_trend");
    if (error) throw error;
    const rows = (data ?? []) as Array<{
      month_label: string;
      month_start: string;
      revenue: number | string;
    }>;

    // DB'den gelen ay başlangıçlarını map'e al
    const pointsByKey = new Map(
      rows.map((r) => [r.month_start.slice(0, 7), Number(r.revenue)])
    );

    // Her zaman 12 ay (boş olanlar 0₺), Türkçe etiket
    const filled: MrrTrendPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
      filled.push({
        month_label: label,
        month_start: `${key}-01`,
        revenue: pointsByKey.get(key) ?? 0,
      });
    }
    return { data: filled, error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getCurrentMrr(): Promise<QueryResult<{ totalMrr: number; breakdown: MrrPlanBreakdown[] }>> {
  try {
    const { data, error } = await supabase.rpc("get_current_mrr");
    if (error) throw error;
    const rows = (data ?? []) as MrrPlanBreakdown[];
    const totalMrr = rows.reduce((s, r) => s + Number(r.plan_mrr), 0);
    return { data: { totalMrr, breakdown: rows }, error: null };
  } catch (e) {
    return { data: { totalMrr: 0, breakdown: [] }, error: String(e) };
  }
}

export async function getTrialExpirations(warningDays = 14): Promise<QueryResult<TrialExpiration[]>> {
  try {
    const { data, error } = await supabase.rpc("get_trial_expirations", { warning_days: warningDays });
    if (error) throw error;
    return { data: (data as TrialExpiration[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getNewRegistrations(lookbackDays = 30): Promise<QueryResult<NewRegistration[]>> {
  try {
    const { data, error } = await supabase.rpc("get_new_registrations", { lookback_days: lookbackDays });
    if (error) throw error;
    return { data: (data as NewRegistration[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getActivationFunnel(): Promise<QueryResult<ActivationFunnel>> {
  const empty: ActivationFunnel = { totalBusinesses: 0, activated1Plus: 0, powerUsers10Plus: 0 };
  try {
    const { data, error } = await supabase.rpc("get_activation_funnel");
    if (error) throw error;
    const row = (data as Array<{
      total_businesses: number;
      activated_1plus: number;
      power_users_10plus: number;
    }>)?.[0];
    if (!row) return { data: empty, error: null };
    return {
      data: {
        totalBusinesses:  Number(row.total_businesses),
        activated1Plus:   Number(row.activated_1plus),
        powerUsers10Plus: Number(row.power_users_10plus),
      },
      error: null,
    };
  } catch (e) {
    return { data: empty, error: String(e) };
  }
}

// ── Platform Karşılaştırma ────────────────────────────────────

export type PlatformAverages = {
  avgScans:     number;
  avgRevenue:   number;
  avgCustomers: number;
};

export async function getPlatformAverages(period = "7d"): Promise<QueryResult<PlatformAverages>> {
  const empty: PlatformAverages = { avgScans: 0, avgRevenue: 0, avgCustomers: 0 };
  try {
    const { data, error } = await supabase.rpc("get_platform_averages", { period_key: period });
    if (error) throw error;
    const row = (data as Array<{
      avg_scans: number;
      avg_revenue: number;
      avg_customers: number;
    }>)?.[0];
    if (!row) return { data: empty, error: null };
    return {
      data: {
        avgScans:     Number(row.avg_scans),
        avgRevenue:   Number(row.avg_revenue),
        avgCustomers: Number(row.avg_customers),
      },
      error: null,
    };
  } catch (e) {
    return { data: empty, error: String(e) };
  }
}

// ── Günlük Tarama Sayıları (Anomali Tespiti) ──────────────────

export async function getDailyScanCounts(
  days = 14
): Promise<QueryResult<Array<{ date: string; scans: number }>>> {
  const from = new Date(Date.now() - days * 86400000).toISOString();
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("scanned_at")
      .gte("scanned_at", from);
    if (error) throw error;

    // Her günü sıfırla
    const dayMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = 0;
    }
    data?.forEach((row) => {
      const key = new Date(row.scanned_at).toISOString().split("T")[0];
      if (key in dayMap) dayMap[key] = (dayMap[key] || 0) + 1;
    });
    return {
      data: Object.entries(dayMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, scans]) => ({ date, scans })),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

// ── Müşteri Büyüme Trendi ─────────────────────────────────────

export type CustomerGrowthPoint = {
  label:        string;
  newCustomers: number;
};

export async function getCustomerGrowthTrend(
  granularity: "weekly" | "monthly" = "weekly"
): Promise<QueryResult<CustomerGrowthPoint[]>> {
  try {
    const { data, error } = await supabase.rpc("get_customer_growth_trend", { granularity });
    if (error) throw error;
    return {
      data: ((data ?? []) as Array<{ period_label: string; new_customers: number }>).map((r) => ({
        label:        r.period_label,
        newCustomers: Number(r.new_customers),
      })),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}
