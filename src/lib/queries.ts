import { supabase } from "./supabase";

// ─── HELPERS ──────────────────────────────────────────────

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

export type QueryResult<T> = { data: T; error: string | null };

// ─── SCANS ────────────────────────────────────────────────

export async function getScansByHour(period = "today"): Promise<QueryResult<Array<{ hour: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans").select("scanned_at")
      .gte("scanned_at", from).lte("scanned_at", to);
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
    return { data: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, scans: 0 })), error: String(e) };
  }
}

export async function getScansByCity(period = "7d"): Promise<QueryResult<Array<{ city: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans").select("city")
      .gte("scanned_at", from).lte("scanned_at", to);
    if (error) throw error;

    const cityMap: Record<string, number> = {};
    data?.forEach((row) => { cityMap[row.city] = (cityMap[row.city] || 0) + 1; });
    return {
      data: Object.entries(cityMap)
        .map(([city, scans]) => ({ city, scans }))
        .sort((a, b) => b.scans - a.scans).slice(0, 8),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getScansByZone(period = "today"): Promise<QueryResult<Array<{ zone: string; scans: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans").select("zone")
      .gte("scanned_at", from).lte("scanned_at", to);
    if (error) throw error;

    const zoneMap: Record<string, number> = {};
    data?.forEach((row) => { zoneMap[row.zone] = (zoneMap[row.zone] || 0) + 1; });
    return { data: Object.entries(zoneMap).map(([zone, scans]) => ({ zone, scans })), error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getTopTables(limit = 10, period = "today"): Promise<QueryResult<Array<{ tableId: string; zone: string; scans: number; avgDuration: number }>>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans").select("table_id, zone, duration_minutes")
      .gte("scanned_at", from).lte("scanned_at", to);
    if (error) throw error;

    const tableMap: Record<string, { zone: string; scans: number; totalDuration: number }> = {};
    data?.forEach((row) => {
      if (!tableMap[row.table_id]) tableMap[row.table_id] = { zone: row.zone, scans: 0, totalDuration: 0 };
      tableMap[row.table_id].scans += 1;
      tableMap[row.table_id].totalDuration += row.duration_minutes ?? 0;
    });
    return {
      data: Object.entries(tableMap)
        .map(([tableId, stats]) => ({ tableId, zone: stats.zone, scans: stats.scans, avgDuration: Math.round(stats.totalDuration / stats.scans) }))
        .sort((a, b) => b.scans - a.scans).slice(0, limit),
      error: null,
    };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getPeriodKPIs(period = "today"): Promise<QueryResult<{ totalScans: number; peakHour: string; activeCities: number; activeZones: number }>> {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans").select("scanned_at, city, zone")
      .gte("scanned_at", from).lte("scanned_at", to);
    if (error) throw error;

    const totalScans = data?.length ?? 0;
    const hourMap: Record<number, number> = {};
    data?.forEach((row) => {
      const h = new Date(row.scanned_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const peakEntry = Object.entries(hourMap).reduce((max, [h, c]) => (c > max[1] ? [h, c] : max), ["0", 0] as [string, number]);
    const peakHour = totalScans > 0 ? `${String(peakEntry[0]).padStart(2, "0")}:00` : "--";
    return {
      data: { totalScans, peakHour, activeCities: new Set(data?.map((r) => r.city)).size, activeZones: new Set(data?.map((r) => r.zone)).size },
      error: null,
    };
  } catch (e) {
    return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
  }
}

export async function getComparisonKPIs(period = "today"): Promise<QueryResult<{ totalScans: number; peakHour: string; activeCities: number; activeZones: number }>> {
  // Bir önceki eşdeğer dönem (today → dün, 7d → önceki 7 gün, 30d → önceki 30 gün)
  let prevPeriod: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const d = new Date(period);
    d.setDate(d.getDate() - 1);
    prevPeriod = d.toISOString().split("T")[0];
  } else if (period === "7d") {
    const from = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];
    const to = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    prevPeriod = from; // özel aralık — burada getPeriodKPIs'i 7d-14d için çağırıyoruz
    const { from: f } = getPeriodRange("7d");
    const prevFrom = new Date(new Date(f).getTime() - 7 * 86400000).toISOString();
    try {
      const { data, error } = await supabase
        .from("scans").select("scanned_at, city, zone")
        .gte("scanned_at", prevFrom).lte("scanned_at", f);
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      return { data: { totalScans, peakHour: "--", activeCities: new Set(data?.map((r) => r.city)).size, activeZones: new Set(data?.map((r) => r.zone)).size }, error: null };
    } catch (e) {
      return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
    }
    void to; void from;
  } else if (period === "30d") {
    const { from: f } = getPeriodRange("30d");
    const prevFrom = new Date(new Date(f).getTime() - 30 * 86400000).toISOString();
    try {
      const { data, error } = await supabase
        .from("scans").select("scanned_at, city, zone")
        .gte("scanned_at", prevFrom).lte("scanned_at", f);
      if (error) throw error;
      const totalScans = data?.length ?? 0;
      return { data: { totalScans, peakHour: "--", activeCities: new Set(data?.map((r) => r.city)).size, activeZones: new Set(data?.map((r) => r.zone)).size }, error: null };
    } catch (e) {
      return { data: { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 }, error: String(e) };
    }
  } else {
    // today → dün
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    prevPeriod = yesterday;
  }
  return getPeriodKPIs(prevPeriod);
}

export async function getWeeklyStats(): Promise<QueryResult<{ total: number; avgPerDay: number; bestDay: string; dailyData: Array<{ day: string; scans: number }> }>> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  try {
    const { data, error } = await supabase.from("scans").select("scanned_at").gte("scanned_at", weekAgo);
    if (error) throw error;

    const total = data?.length ?? 0;
    const dayMap: Record<string, number> = {};
    data?.forEach((row) => {
      const day = new Date(row.scanned_at).toLocaleDateString("tr-TR", { weekday: "short" });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const dailyData = Object.entries(dayMap).map(([day, scans]) => ({ day, scans }));
    const bestDay = dailyData.reduce((max, d) => (d.scans > max.scans ? d : max), dailyData[0] ?? { day: "--", scans: 0 });
    return { data: { total, avgPerDay: Math.round(total / 7), bestDay: bestDay.day, dailyData }, error: null };
  } catch (e) {
    return { data: { total: 0, avgPerDay: 0, bestDay: "--", dailyData: [] }, error: String(e) };
  }
}

// ─── ORDERS ───────────────────────────────────────────────

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

export async function getOrders(limit = 50, sortBy = "created_at", sortDir: "asc" | "desc" = "desc", search = ""): Promise<QueryResult<Order[]>> {
  const col: OrderSortCol = (VALID_ORDER_SORT_COLS as readonly string[]).includes(sortBy) ? (sortBy as OrderSortCol) : "created_at";
  try {
    let query = supabase
      .from("orders")
      .select("id, table_id, zone, total_amount, status, created_at")
      .order(col, { ascending: sortDir === "asc" })
      .limit(limit);
    if (search) query = query.or(`table_id.ilike.%${search}%,zone.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data as Order[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getOrderStats(): Promise<QueryResult<{ totalRevenue: number; completed: number; pending: number; cancelled: number; avgAmount: number; cancelRate: number }>> {
  try {
    const { data, error } = await supabase.from("orders").select("total_amount, status");
    if (error) throw error;

    const totalRevenue = data?.reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0;
    const completed = data?.filter((o) => o.status === "completed").length ?? 0;
    const pending = data?.filter((o) => o.status === "pending").length ?? 0;
    const cancelled = data?.filter((o) => o.status === "cancelled").length ?? 0;
    const total = data?.length ?? 0;
    const avgAmount = total > 0 ? Math.round(totalRevenue / total) : 0;
    const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    return { data: { totalRevenue, completed, pending, cancelled, avgAmount, cancelRate }, error: null };
  } catch (e) {
    return { data: { totalRevenue: 0, completed: 0, pending: 0, cancelled: 0, avgAmount: 0, cancelRate: 0 }, error: String(e) };
  }
}

export async function getConversionRate(): Promise<QueryResult<{ scanCount: number; orderCount: number; rate: number }>> {
  try {
    const [scansRes, ordersRes] = await Promise.all([
      supabase.from("scans").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);
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

// ─── CUSTOMERS ────────────────────────────────────────────

export type Customer = {
  id: number;
  name: string;
  city: string;
  visit_count: number;
  last_visit: string;
};

export async function getCustomers(limit = 20, offset = 0, search = ""): Promise<QueryResult<Customer[]>> {
  try {
    let query = supabase
      .from("customers")
      .select("id, name, city, visit_count, last_visit")
      .order("visit_count", { ascending: false })
      .range(offset, offset + limit - 1);
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data as Customer[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: String(e) };
  }
}

export async function getCustomerStats(): Promise<QueryResult<{ total: number; returning: number; newThisWeek: number }>> {
  try {
    const { data, error } = await supabase.from("customers").select("visit_count, last_visit");
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

export async function getCustomerCount(search = ""): Promise<number> {
  try {
    let query = supabase.from("customers").select("id", { count: "exact", head: true });
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}
