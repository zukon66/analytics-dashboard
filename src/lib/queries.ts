import { cookies } from "next/headers";
import { createSupabaseServer } from "./supabase/server";
import {
  hasRows,
  mockGetActivationFunnel,
  mockGetBusinessById,
  mockGetBusinesses,
  mockGetBusinessScanCounts,
  mockGetChurnRiskBusinesses,
  mockGetConversionRate,
  mockGetCurrentMrr,
  mockGetCustomerCount,
  mockGetCustomerGrowthTrend,
  mockGetCustomers,
  mockGetCustomerStats,
  mockGetDailyScanCounts,
  mockGetTablePerformance,
  mockGetTableDetail,
  mockGetMrrTrend,
  mockGetNewRegistrations,
  mockGetOrders,
  mockGetOrderStats,
  mockGetPeriodKPIs,
  mockGetPlatformAverages,
  mockGetPlatformKPIs,
  mockGetRevenueByDay,
  mockGetRevenueByZone,
  mockGetScansByCity,
  mockGetScansByHour,
  mockGetScansByPlan,
  mockGetScansByZone,
  mockGetTopMenuItems,
  mockGetTopTables,
  mockGetTrialExpirations,
  mockGetWeeklyStats,
} from "./mockData";

// ─── HELPERS ──────────────────────────────────────────────────

async function getDb() {
  const cookieStore = await cookies();
  if (cookieStore.get("kokos_business_demo")?.value === "1") {
    throw new Error("Demo işletme oturumunda mock veri kullanılıyor.");
  }
  return createSupabaseServer();
}

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
    const { data, error } = await (await getDb()).rpc("get_businesses_list", { search_term: search });
    if (error) throw error;
    const rows = (data as Business[]) ?? [];
    return { data: hasRows(rows) ? rows : mockGetBusinesses(search), error: null };
  } catch {
    return { data: mockGetBusinesses(search), error: null };
  }
}

export async function getBusinessById(id: number): Promise<QueryResult<Business | null>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_business_by_id", { business_id: id });
    if (error) throw error;
    const rows = data as Business[];
    return { data: rows?.[0] ?? mockGetBusinessById(id), error: null };
  } catch {
    return { data: mockGetBusinessById(id), error: null };
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
    const { data, error } = await (await getDb()).rpc("get_platform_kpis");
    if (error) throw error;
    const rows = data as Array<{
      totalbusinesses: number; activebusinesses: number; churnriskcount: number;
      totalscanstoday?: number; totalscanstown?: number; totalscansweek: number; totalrevenuealltime: number;
    }>;
    if (!hasRows(rows)) return { data: mockGetPlatformKPIs(), error: null };
    const d = rows?.[0] ?? {} as typeof rows[0];
    return {
      data: {
        totalBusinesses:    d.totalbusinesses    ?? 0,
        activeBusinesses:   d.activebusinesses   ?? 0,
        churnRiskCount:     d.churnriskcount     ?? 0,
        totalScansToday:    d.totalscanstoday ?? d.totalscanstown ?? 0,
        totalScansWeek:     d.totalscansweek     ?? 0,
        totalRevenueAllTime: d.totalrevenuealltime ?? 0,
      },
      error: null,
    };
  } catch {
    return { data: mockGetPlatformKPIs(), error: null };
  }
}

export async function getChurnRiskBusinesses(inactiveDays = 14): Promise<
  QueryResult<Array<Business & { daysSinceActive: number }>>
> {
  try {
    const { data, error } = await (await getDb()).rpc("get_churn_risk_businesses", { inactive_days: inactiveDays });
    if (error) throw error;
    const rows = (data ?? []) as Array<Business & { days_since_active: number }>;
    return {
      data: hasRows(rows)
        ? rows.map((b) => ({
        ...b,
        daysSinceActive: b.days_since_active ?? 999,
          }))
        : mockGetChurnRiskBusinesses(inactiveDays),
      error: null,
    };
  } catch {
    return { data: mockGetChurnRiskBusinesses(inactiveDays), error: null };
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
    const { data } = await (await getDb()).from("scans")
      .select("business_id")
      .in("business_id", businessIds)
      .gte("scanned_at", from);
    const counts: Record<number, number> = {};
    data?.forEach((row) => {
      counts[row.business_id] = (counts[row.business_id] ?? 0) + 1;
    });
    return Object.keys(counts).length > 0 ? counts : mockGetBusinessScanCounts(businessIds, days);
  } catch {
    return mockGetBusinessScanCounts(businessIds, days);
  }
}

// ─── SCANS ────────────────────────────────────────────────────

export async function getScansByHour(
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ hour: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = (await getDb()).from("scans").select("scanned_at").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    data?.forEach((row) => {
      const hour = new Date(row.scanned_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const rows = Object.entries(hourMap).map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        scans: count,
      }));
    return { data: rows.some((row) => row.scans > 0) ? rows : mockGetScansByHour(period, businessId), error: null };
  } catch {
    return { data: mockGetScansByHour(period, businessId), error: null };
  }
}

export async function getScansByCity(
  period = "7d",
  businessId?: number
): Promise<QueryResult<Array<{ city: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = (await getDb()).from("scans").select("city").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const cityMap: Record<string, number> = {};
    data?.forEach((row) => { cityMap[row.city] = (cityMap[row.city] || 0) + 1; });
    const rows = Object.entries(cityMap)
        .map(([city, scans]) => ({ city, scans }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 8);
    return { data: hasRows(rows) ? rows : mockGetScansByCity(period, businessId), error: null };
  } catch {
    return { data: mockGetScansByCity(period, businessId), error: null };
  }
}

export async function getScansByPlan(
  period = "7d"
): Promise<QueryResult<Array<{ zone: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await (await getDb()).from("scans")
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

    const rows = Object.entries(planMap)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([plan, scans]) => ({ zone: PLAN_LABELS[plan] ?? plan, scans }));
    return { data: hasRows(rows) ? rows : mockGetScansByPlan(period), error: null };
  } catch {
    return { data: mockGetScansByPlan(period), error: null };
  }
}

export async function getScansByZone(
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ zone: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = (await getDb()).from("scans").select("zone").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const zoneMap: Record<string, number> = {};
    data?.forEach((row) => { zoneMap[row.zone] = (zoneMap[row.zone] || 0) + 1; });
    const rows = Object.entries(zoneMap).map(([zone, scans]) => ({ zone, scans }));
    return { data: hasRows(rows) ? rows : mockGetScansByZone(period, businessId), error: null };
  } catch {
    return { data: mockGetScansByZone(period, businessId), error: null };
  }
}

export async function getTopTables(
  limit = 10,
  period = "today",
  businessId?: number
): Promise<QueryResult<Array<{ tableId: string; zone: string; scans: number; avgDuration: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = (await getDb()).from("scans")
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
    const rows = Object.entries(tableMap)
        .map(([tableId, stats]) => ({
          tableId,
          zone: stats.zone,
          scans: stats.scans,
          avgDuration: Math.round(stats.totalDuration / stats.scans),
        }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, limit);
    return { data: hasRows(rows) ? rows : mockGetTopTables(limit, period, businessId), error: null };
  } catch {
    return { data: mockGetTopTables(limit, period, businessId), error: null };
  }
}

export async function getPeriodKPIs(
  period = "today",
  businessId?: number
): Promise<QueryResult<{ totalScans: number; peakHour: string; activeCities: number; activeZones: number }>> {
  const { from, to } = getPeriodRange(period);
  try {
    let query = (await getDb()).from("scans").select("scanned_at, city, zone").gte("scanned_at", from).lte("scanned_at", to);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const totalScans = data?.length ?? 0;
    if (totalScans === 0) return { data: mockGetPeriodKPIs(period, businessId), error: null };
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
  } catch {
    return { data: mockGetPeriodKPIs(period, businessId), error: null };
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
      let query = (await getDb()).from("scans").select("scanned_at, city, zone").gte("scanned_at", prevFrom).lte("scanned_at", prevTo);
      query = applyBusinessFilter(query, businessId);
      const { data, error } = await query;
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      if (totalScans === 0) return { data: mockGetPeriodKPIs("7d", businessId), error: null };
      return {
        data: {
          totalScans,
          peakHour: "--",
          activeCities: new Set(data?.map((r) => r.city)).size,
          activeZones: new Set(data?.map((r) => r.zone)).size,
        },
        error: null,
      };
    } catch {
      return { data: mockGetPeriodKPIs("7d", businessId), error: null };
    }
  } else if (period === "30d") {
    // son 30 gün → önceki 30 gün
    const now = new Date();
    const prevTo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const prevFrom = new Date(now.getTime() - 60 * 86400000).toISOString();
    try {
      let query = (await getDb()).from("scans").select("scanned_at, city, zone").gte("scanned_at", prevFrom).lte("scanned_at", prevTo);
      query = applyBusinessFilter(query, businessId);
      const { data, error } = await query;
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      if (totalScans === 0) return { data: mockGetPeriodKPIs("30d", businessId), error: null };
      return {
        data: {
          totalScans,
          peakHour: "--",
          activeCities: new Set(data?.map((r) => r.city)).size,
          activeZones: new Set(data?.map((r) => r.zone)).size,
        },
        error: null,
      };
    } catch {
      return { data: mockGetPeriodKPIs("30d", businessId), error: null };
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
    let query = (await getDb()).from("scans").select("scanned_at").gte("scanned_at", weekAgo);
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
    if (!dailyData.some((day) => day.scans > 0)) return { data: mockGetWeeklyStats(businessId), error: null };
    const bestDay = dailyData.reduce(
      (max, d) => (d.scans > max.scans ? d : max),
      dailyData[0] ?? { day: "--", scans: 0 }
    );
    return { data: { total, avgPerDay: Math.round(total / 7), bestDay: bestDay.day, dailyData }, error: null };
  } catch {
    return { data: mockGetWeeklyStats(businessId), error: null };
  }
}

// ─── ORDERS ───────────────────────────────────────────────────

export type OrderItem = {
  name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Order = {
  id: number;
  table_id: string;
  zone: string;
  total_amount: number;
  status: "completed" | "pending" | "cancelled";
  created_at: string;
  items?: OrderItem[];
};

const VALID_ORDER_SORT_COLS = ["id", "table_id", "total_amount", "created_at", "zone", "status"] as const;
type OrderSortCol = (typeof VALID_ORDER_SORT_COLS)[number];

export async function getOrders(
  limit = 50,
  sortBy = "created_at",
  sortDir: "asc" | "desc" = "desc",
  search = "",
  businessId?: number,
  period?: string
): Promise<QueryResult<Order[]>> {
  const col: OrderSortCol = (VALID_ORDER_SORT_COLS as readonly string[]).includes(sortBy)
    ? (sortBy as OrderSortCol)
    : "created_at";
  try {
    let query = (await getDb()).from("orders")
      .select("id, table_id, zone, total_amount, status, created_at")
      .order(col, { ascending: sortDir === "asc" })
      .limit(limit);
    if (search) query = query.or(`table_id.ilike.%${search}%,zone.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    if (period) {
      const { from, to } = getPeriodRange(period);
      query = query.gte("created_at", from).lte("created_at", to);
    }
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data as Order[]) ?? [];
    return { data: hasRows(rows) ? rows : mockGetOrders(limit, col, sortDir, search, businessId, period), error: null };
  } catch {
    return { data: mockGetOrders(limit, col, sortDir, search, businessId, period), error: null };
  }
}

export async function getOrderStats(
  businessId?: number,
  period?: string
): Promise<QueryResult<{ totalRevenue: number; completed: number; pending: number; cancelled: number; avgAmount: number; cancelRate: number }>> {
  try {
    let query = (await getDb()).from("orders").select("total_amount, status");
    query = applyBusinessFilter(query, businessId);
    if (period) {
      const { from, to } = getPeriodRange(period);
      query = query.gte("created_at", from).lte("created_at", to);
    }
    const { data, error } = await query;
    if (error) throw error;

    const totalRevenue = data?.reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0;
    const completed = data?.filter((o) => o.status === "completed").length ?? 0;
    const pending = data?.filter((o) => o.status === "pending").length ?? 0;
    const cancelled = data?.filter((o) => o.status === "cancelled").length ?? 0;
    const total = data?.length ?? 0;
    if (total === 0) return { data: mockGetOrderStats(businessId, period), error: null };
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
  } catch {
    return { data: mockGetOrderStats(businessId, period), error: null };
  }
}

export async function getConversionRate(
  businessId?: number
): Promise<QueryResult<{ scanCount: number; orderCount: number; rate: number }>> {
  try {
    let scansQuery = (await getDb()).from("scans").select("id", { count: "exact", head: true });
    let ordersQuery = (await getDb()).from("orders").select("id", { count: "exact", head: true });
    scansQuery = applyBusinessFilter(scansQuery, businessId);
    ordersQuery = applyBusinessFilter(ordersQuery, businessId);

    const [scansRes, ordersRes] = await Promise.all([scansQuery, ordersQuery]);
    if (scansRes.error) throw scansRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const scanCount = scansRes.count ?? 0;
    const orderCount = ordersRes.count ?? 0;
    if (scanCount === 0 && orderCount === 0) return { data: mockGetConversionRate(businessId), error: null };
    const rate = scanCount > 0 ? Math.round((orderCount / scanCount) * 100) : 0;
    return { data: { scanCount, orderCount, rate }, error: null };
  } catch {
    return { data: mockGetConversionRate(businessId), error: null };
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
    let query = (await getDb()).from("customers")
      .select("id, name, city, visit_count, last_visit")
      .order("visit_count", { ascending: false })
      .range(offset, offset + limit - 1);
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data as Customer[]) ?? [];
    return { data: hasRows(rows) ? rows : mockGetCustomers(limit, offset, search, businessId), error: null };
  } catch {
    return { data: mockGetCustomers(limit, offset, search, businessId), error: null };
  }
}

export async function getCustomerStats(
  businessId?: number
): Promise<QueryResult<{ total: number; returning: number; newThisWeek: number }>> {
  try {
    let query = (await getDb()).from("customers").select("visit_count, last_visit");
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const total = data?.length ?? 0;
    if (total === 0) return { data: mockGetCustomerStats(businessId), error: null };
    const returning = data?.filter((c) => c.visit_count > 1).length ?? 0;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const newThisWeek = data?.filter((c) => new Date(c.last_visit) >= new Date(weekAgo)).length ?? 0;
    return { data: { total, returning, newThisWeek }, error: null };
  } catch {
    return { data: mockGetCustomerStats(businessId), error: null };
  }
}

export async function getCustomerCount(search = "", businessId?: number): Promise<number> {
  try {
    let query = (await getDb()).from("customers").select("id", { count: "exact", head: true });
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    query = applyBusinessFilter(query, businessId);
    const { count } = await query;
    return count && count > 0 ? count : mockGetCustomerCount(search, businessId);
  } catch {
    return mockGetCustomerCount(search, businessId);
  }
}

export type TablePerformance = {
  tableId: string;
  zone: string;
  scans: number;
  orders: number;
  revenue: number;
  avgAmount: number;
  avgDuration: number;
  conversionRate: number;
  peakHour: string;
  lastActivity: string;
};

export type TableDetail = {
  summary: TablePerformance;
  hourly: Array<{ hour: string; scans: number; orders: number }>;
  statusBreakdown: { completed: number; pending: number; cancelled: number };
  recentOrders: Order[];
  recentScans: Array<{ id: number; scanned_at: string; duration_minutes: number; zone: string }>;
};

export async function getTablePerformance(
  search = "",
  businessId?: number
): Promise<QueryResult<TablePerformance[]>> {
  try {
    let scansQuery = (await getDb()).from("scans")
      .select("table_id, zone, scanned_at, duration_minutes")
      .order("scanned_at", { ascending: false });
    let ordersQuery = (await getDb()).from("orders")
      .select("table_id, zone, total_amount, status, created_at")
      .order("created_at", { ascending: false });

    scansQuery = applyBusinessFilter(scansQuery, businessId);
    ordersQuery = applyBusinessFilter(ordersQuery, businessId);

    if (search) {
      scansQuery = scansQuery.or(`table_id.ilike.%${search}%,zone.ilike.%${search}%`);
      ordersQuery = ordersQuery.or(`table_id.ilike.%${search}%,zone.ilike.%${search}%`);
    }

    const [scansRes, ordersRes] = await Promise.all([scansQuery, ordersQuery]);
    if (scansRes.error) throw scansRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const map: Record<
      string,
      {
        tableId: string;
        zone: string;
        scans: number;
        totalDuration: number;
        orders: number;
        revenue: number;
        lastActivity: string;
        hourly: Record<number, number>;
      }
    > = {};

    scansRes.data?.forEach((scan) => {
      map[scan.table_id] ??= {
        tableId: scan.table_id,
        zone: scan.zone,
        scans: 0,
        totalDuration: 0,
        orders: 0,
        revenue: 0,
        lastActivity: scan.scanned_at,
        hourly: {},
      };
      const row = map[scan.table_id];
      row.zone = scan.zone;
      row.scans += 1;
      row.totalDuration += scan.duration_minutes ?? 0;
      row.lastActivity = scan.scanned_at > row.lastActivity ? scan.scanned_at : row.lastActivity;
      const hour = new Date(scan.scanned_at).getHours();
      row.hourly[hour] = (row.hourly[hour] ?? 0) + 1;
    });

    ordersRes.data?.forEach((order) => {
      map[order.table_id] ??= {
        tableId: order.table_id,
        zone: order.zone,
        scans: 0,
        totalDuration: 0,
        orders: 0,
        revenue: 0,
        lastActivity: order.created_at,
        hourly: {},
      };
      const row = map[order.table_id];
      row.zone = order.zone;
      row.orders += 1;
      row.revenue += order.status === "cancelled" ? 0 : Number(order.total_amount ?? 0);
      row.lastActivity = order.created_at > row.lastActivity ? order.created_at : row.lastActivity;
    });

    const rows = Object.values(map)
      .map((row) => {
        const peakHour = Object.entries(row.hourly).sort((a, b) => b[1] - a[1])[0]?.[0];
        return {
          tableId: row.tableId,
          zone: row.zone,
          scans: row.scans,
          orders: row.orders,
          revenue: row.revenue,
          avgAmount: Math.round(row.revenue / Math.max(row.orders, 1)),
          avgDuration: Math.round(row.totalDuration / Math.max(row.scans, 1)),
          conversionRate: Math.round((row.orders / Math.max(row.scans, 1)) * 100),
          peakHour: peakHour ? `${peakHour.padStart(2, "0")}:00` : "--",
          lastActivity: row.lastActivity,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return { data: hasRows(rows) ? rows : mockGetTablePerformance(search, businessId), error: null };
  } catch {
    return { data: mockGetTablePerformance(search, businessId), error: null };
  }
}

export async function getTableDetail(
  tableId: string,
  businessId?: number
): Promise<QueryResult<TableDetail>> {
  const normalizedTableId = decodeURIComponent(tableId);

  try {
    let scansQuery = (await getDb()).from("scans")
      .select("id, table_id, zone, scanned_at, duration_minutes")
      .eq("table_id", normalizedTableId)
      .order("scanned_at", { ascending: false });
    let ordersQuery = (await getDb()).from("orders")
      .select("id, table_id, zone, total_amount, status, created_at")
      .eq("table_id", normalizedTableId)
      .order("created_at", { ascending: false });

    scansQuery = applyBusinessFilter(scansQuery, businessId);
    ordersQuery = applyBusinessFilter(ordersQuery, businessId);

    const [scansRes, ordersRes, performanceRes] = await Promise.all([
      scansQuery,
      ordersQuery,
      getTablePerformance("", businessId),
    ]);
    if (scansRes.error) throw scansRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const scans = scansRes.data ?? [];
    const orders = (ordersRes.data as Order[] | null) ?? [];
    const performance = performanceRes.data.find((table) => table.tableId === normalizedTableId);
    const revenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      scans: scans.filter((scan) => new Date(scan.scanned_at).getHours() === hour).length,
      orders: orders.filter((order) => new Date(order.created_at).getHours() === hour).length,
    }))
      .sort((a, b) => b.scans + b.orders - (a.scans + a.orders))
      .slice(0, 8);

    const summary: TablePerformance = performance ?? {
      tableId: normalizedTableId,
      zone: scans[0]?.zone ?? orders[0]?.zone ?? "Salon",
      scans: scans.length,
      orders: orders.length,
      revenue,
      avgAmount: Math.round(revenue / Math.max(orders.length, 1)),
      avgDuration: Math.round(scans.reduce((sum, scan) => sum + (scan.duration_minutes ?? 0), 0) / Math.max(scans.length, 1)),
      conversionRate: Math.round((orders.length / Math.max(scans.length, 1)) * 100),
      peakHour: hourly[0]?.hour ?? "--",
      lastActivity: scans[0]?.scanned_at ?? orders[0]?.created_at ?? new Date().toISOString(),
    };

    const rows: TableDetail = {
      summary,
      hourly,
      statusBreakdown: {
        completed: orders.filter((order) => order.status === "completed").length,
        pending: orders.filter((order) => order.status === "pending").length,
        cancelled: orders.filter((order) => order.status === "cancelled").length,
      },
      recentOrders: orders.slice(0, 12),
      recentScans: scans.slice(0, 8).map((scan) => ({
        id: scan.id,
        scanned_at: scan.scanned_at,
        duration_minutes: scan.duration_minutes ?? 0,
        zone: scan.zone,
      })),
    };

    return { data: rows.summary.scans > 0 || rows.summary.orders > 0 ? rows : mockGetTableDetail(normalizedTableId, businessId), error: null };
  } catch {
    return { data: mockGetTableDetail(normalizedTableId, businessId), error: null };
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
    const { data, error } = await (await getDb()).rpc("get_mrr_trend");
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
    return { data: filled.some((point) => point.revenue > 0) ? filled : mockGetMrrTrend(), error: null };
  } catch {
    return { data: mockGetMrrTrend(), error: null };
  }
}

export async function getCurrentMrr(): Promise<QueryResult<{ totalMrr: number; breakdown: MrrPlanBreakdown[] }>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_current_mrr");
    if (error) throw error;
    const rows = (data ?? []) as MrrPlanBreakdown[];
    const totalMrr = rows.reduce((s, r) => s + Number(r.plan_mrr), 0);
    return { data: totalMrr > 0 ? { totalMrr, breakdown: rows } : mockGetCurrentMrr(), error: null };
  } catch {
    return { data: mockGetCurrentMrr(), error: null };
  }
}

export async function getTrialExpirations(warningDays = 14): Promise<QueryResult<TrialExpiration[]>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_trial_expirations", { warning_days: warningDays });
    if (error) throw error;
    const rows = (data as TrialExpiration[]) ?? [];
    return { data: hasRows(rows) ? rows : mockGetTrialExpirations(warningDays), error: null };
  } catch {
    return { data: mockGetTrialExpirations(warningDays), error: null };
  }
}

export async function getNewRegistrations(lookbackDays = 30): Promise<QueryResult<NewRegistration[]>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_new_registrations", { lookback_days: lookbackDays });
    if (error) throw error;
    const rows = (data as NewRegistration[]) ?? [];
    return { data: hasRows(rows) ? rows : mockGetNewRegistrations(lookbackDays), error: null };
  } catch {
    return { data: mockGetNewRegistrations(lookbackDays), error: null };
  }
}

export async function getActivationFunnel(): Promise<QueryResult<ActivationFunnel>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_activation_funnel");
    if (error) throw error;
    const row = (data as Array<{
      total_businesses: number;
      activated_1plus: number;
      power_users_10plus: number;
    }>)?.[0];
    if (!row) return { data: mockGetActivationFunnel(), error: null };
    return {
      data: {
        totalBusinesses:  Number(row.total_businesses),
        activated1Plus:   Number(row.activated_1plus),
        powerUsers10Plus: Number(row.power_users_10plus),
      },
      error: null,
    };
  } catch {
    return { data: mockGetActivationFunnel(), error: null };
  }
}

// ── Platform Karşılaştırma ────────────────────────────────────

export type PlatformAverages = {
  avgScans:     number;
  avgRevenue:   number;
  avgCustomers: number;
};

export async function getPlatformAverages(period = "7d"): Promise<QueryResult<PlatformAverages>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_platform_averages", { period_key: period });
    if (error) throw error;
    const row = (data as Array<{
      avg_scans: number;
      avg_revenue: number;
      avg_customers: number;
    }>)?.[0];
    if (!row) return { data: mockGetPlatformAverages(period), error: null };
    return {
      data: {
        avgScans:     Number(row.avg_scans),
        avgRevenue:   Number(row.avg_revenue),
        avgCustomers: Number(row.avg_customers),
      },
      error: null,
    };
  } catch {
    return { data: mockGetPlatformAverages(period), error: null };
  }
}

// ── Günlük Tarama Sayıları (Anomali Tespiti) ──────────────────

export async function getDailyScanCounts(
  days = 14
): Promise<QueryResult<Array<{ date: string; scans: number }>>> {
  const from = new Date(Date.now() - days * 86400000).toISOString();
  try {
    const { data, error } = await (await getDb()).from("scans")
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
    const rows = Object.entries(dayMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, scans]) => ({ date, scans }));
    return { data: rows.some((row) => row.scans > 0) ? rows : mockGetDailyScanCounts(days), error: null };
  } catch {
    return { data: mockGetDailyScanCounts(days), error: null };
  }
}

// ── Müşteri Büyüme Trendi ─────────────────────────────────────

export type CustomerGrowthPoint = {
  label:        string;
  newCustomers: number;
};

// ── Menü Analitikleri ─────────────────────────────────────────

export type MenuItemStat = {
  name: string;
  category: string;
  count: number;
  revenue: number;
};

export async function getTopMenuItems(
  limit = 10,
  businessId?: number,
  period?: string
): Promise<QueryResult<MenuItemStat[]>> {
  // Supabase'de order_items tablosu olmadığından doğrudan mock kullan
  return { data: mockGetTopMenuItems(limit, businessId, period), error: null };
}

// ── Ciro Analitikleri ─────────────────────────────────────────

export type RevenueDayPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export async function getRevenueByDay(
  days = 14,
  businessId?: number
): Promise<QueryResult<RevenueDayPoint[]>> {
  try {
    let query = (await getDb())
      .from("orders")
      .select("created_at, total_amount")
      .neq("status", "cancelled");
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const end = new Date();
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 86400000);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { revenue: 0, orders: 0 };
    }
    data?.forEach((row) => {
      const key = new Date(row.created_at).toISOString().split("T")[0];
      if (key in dayMap) {
        dayMap[key].revenue += Number(row.total_amount ?? 0);
        dayMap[key].orders += 1;
      }
    });
    const rows = Object.entries(dayMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, { revenue, orders }]) => ({ date, revenue, orders }));
    return { data: rows.some((r) => r.revenue > 0) ? rows : mockGetRevenueByDay(days, businessId), error: null };
  } catch {
    return { data: mockGetRevenueByDay(days, businessId), error: null };
  }
}

export type RevenueZone = {
  zone: string;
  revenue: number;
  orders: number;
};

export async function getRevenueByZone(
  businessId?: number
): Promise<QueryResult<RevenueZone[]>> {
  try {
    let query = (await getDb())
      .from("orders")
      .select("zone, total_amount")
      .neq("status", "cancelled");
    query = applyBusinessFilter(query, businessId);
    const { data, error } = await query;
    if (error) throw error;

    const map: Record<string, { zone: string; revenue: number; orders: number }> = {};
    data?.forEach((row) => {
      map[row.zone] ??= { zone: row.zone, revenue: 0, orders: 0 };
      map[row.zone].revenue += Number(row.total_amount ?? 0);
      map[row.zone].orders += 1;
    });
    const rows = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    return { data: hasRows(rows) ? rows : mockGetRevenueByZone(businessId), error: null };
  } catch {
    return { data: mockGetRevenueByZone(businessId), error: null };
  }
}

export async function getCustomerGrowthTrend(
  granularity: "weekly" | "monthly" = "weekly"
): Promise<QueryResult<CustomerGrowthPoint[]>> {
  try {
    const { data, error } = await (await getDb()).rpc("get_customer_growth_trend", { granularity });
    if (error) throw error;
    const rows = ((data ?? []) as Array<{ period_label: string; new_customers: number }>).map((r) => ({
        label:        r.period_label,
        newCustomers: Number(r.new_customers),
      }));
    return { data: hasRows(rows) ? rows : mockGetCustomerGrowthTrend(granularity), error: null };
  } catch {
    return { data: mockGetCustomerGrowthTrend(granularity), error: null };
  }
}
