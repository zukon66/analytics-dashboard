import { supabase } from "./supabase";

// ─── HELPERS ──────────────────────────────────────────────

function getPeriodRange(period: string): { from: string; to: string } {
  const now = new Date();
  // Belirli bir tarih (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return {
      from: `${period}T00:00:00`,
      to: `${period}T23:59:59`,
    };
  }
  if (period === "7d") {
    return {
      from: new Date(Date.now() - 7 * 86400000).toISOString(),
      to: now.toISOString(),
    };
  }
  if (period === "30d") {
    return {
      from: new Date(Date.now() - 30 * 86400000).toISOString(),
      to: now.toISOString(),
    };
  }
  // today (default)
  const today = now.toISOString().split("T")[0];
  return {
    from: `${today}T00:00:00`,
    to: `${today}T23:59:59`,
  };
}

// ─── SCANS ────────────────────────────────────────────────

export async function getScansByHour(period: string = "today") {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("scanned_at")
      .gte("scanned_at", from)
      .lte("scanned_at", to);

    if (error) throw error;

    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    data?.forEach((row) => {
      const hour = new Date(row.scanned_at).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    return Object.entries(hourMap).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      scans: count,
    }));
  } catch {
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      scans: 0,
    }));
  }
}

export async function getScansByCity(period: string = "7d") {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("city")
      .gte("scanned_at", from)
      .lte("scanned_at", to);

    if (error) throw error;

    const cityMap: Record<string, number> = {};
    data?.forEach((row) => {
      cityMap[row.city] = (cityMap[row.city] || 0) + 1;
    });

    return Object.entries(cityMap)
      .map(([city, scans]) => ({ city, scans }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function getScansByZone(period: string = "today") {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("zone")
      .gte("scanned_at", from)
      .lte("scanned_at", to);

    if (error) throw error;

    const zoneMap: Record<string, number> = {};
    data?.forEach((row) => {
      zoneMap[row.zone] = (zoneMap[row.zone] || 0) + 1;
    });

    return Object.entries(zoneMap).map(([zone, scans]) => ({ zone, scans }));
  } catch {
    return [];
  }
}

export async function getTopTables(limit = 10, period: string = "today") {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("table_id, zone, duration_minutes")
      .gte("scanned_at", from)
      .lte("scanned_at", to);

    if (error) throw error;

    const tableMap: Record<
      string,
      { zone: string; scans: number; totalDuration: number }
    > = {};

    data?.forEach((row) => {
      if (!tableMap[row.table_id]) {
        tableMap[row.table_id] = { zone: row.zone, scans: 0, totalDuration: 0 };
      }
      tableMap[row.table_id].scans += 1;
      tableMap[row.table_id].totalDuration += row.duration_minutes ?? 0;
    });

    return Object.entries(tableMap)
      .map(([tableId, stats]) => ({
        tableId,
        zone: stats.zone,
        scans: stats.scans,
        avgDuration: Math.round(stats.totalDuration / stats.scans),
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function getPeriodKPIs(period: string = "today") {
  const { from, to } = getPeriodRange(period);
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("scanned_at, city, zone")
      .gte("scanned_at", from)
      .lte("scanned_at", to);

    if (error) throw error;

    const totalScans = data?.length ?? 0;

    // Peak hour
    const hourMap: Record<number, number> = {};
    data?.forEach((row) => {
      const h = new Date(row.scanned_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const peakEntry = Object.entries(hourMap).reduce(
      (max, [h, c]) => (c > max[1] ? [h, c] : max),
      ["0", 0] as [string, number]
    );
    const peakHour =
      totalScans > 0 ? `${String(peakEntry[0]).padStart(2, "0")}:00` : "--";

    // Active cities & zones
    const activeCities = new Set(data?.map((r) => r.city)).size;
    const activeZones = new Set(data?.map((r) => r.zone)).size;

    return { totalScans, peakHour, activeCities, activeZones };
  } catch {
    return { totalScans: 0, peakHour: "--", activeCities: 0, activeZones: 0 };
  }
}

// Haftalık toplam tarama + günlük ortalama (Analytics sayfası)
export async function getWeeklyStats() {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("scanned_at")
      .gte("scanned_at", weekAgo);

    if (error) throw error;

    const total = data?.length ?? 0;

    const dayMap: Record<string, number> = {};
    data?.forEach((row) => {
      const day = new Date(row.scanned_at).toLocaleDateString("tr-TR", {
        weekday: "short",
      });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    const dailyData = Object.entries(dayMap).map(([day, scans]) => ({
      day,
      scans,
    }));

    const bestDay = dailyData.reduce(
      (max, d) => (d.scans > max.scans ? d : max),
      dailyData[0] ?? { day: "--", scans: 0 }
    );

    return {
      total,
      avgPerDay: Math.round(total / 7),
      bestDay: bestDay.day,
      dailyData,
    };
  } catch {
    return { total: 0, avgPerDay: 0, bestDay: "--", dailyData: [] };
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

export async function getOrders(
  limit = 50,
  sortBy: string = "created_at",
  sortDir: "asc" | "desc" = "desc"
): Promise<Order[]> {
  const col: OrderSortCol = (VALID_ORDER_SORT_COLS as readonly string[]).includes(sortBy)
    ? (sortBy as OrderSortCol)
    : "created_at";
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, table_id, zone, total_amount, status, created_at")
      .order(col, { ascending: sortDir === "asc" })
      .limit(limit);

    if (error) throw error;
    return (data as Order[]) ?? [];
  } catch {
    return [];
  }
}

export async function getOrderStats() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount, status");

    if (error) throw error;

    const totalRevenue = data?.reduce((s, o) => s + (o.total_amount ?? 0), 0) ?? 0;
    const completed = data?.filter((o) => o.status === "completed").length ?? 0;
    const pending = data?.filter((o) => o.status === "pending").length ?? 0;

    return { totalRevenue, completed, pending };
  } catch {
    return { totalRevenue: 0, completed: 0, pending: 0 };
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

export async function getCustomers(limit = 50): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, city, visit_count, last_visit")
      .order("visit_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Customer[]) ?? [];
  } catch {
    return [];
  }
}

export async function getCustomerStats() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("visit_count, last_visit");

    if (error) throw error;

    const total = data?.length ?? 0;
    const returning = data?.filter((c) => c.visit_count > 1).length ?? 0;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const newThisWeek =
      data?.filter((c) => new Date(c.last_visit) >= new Date(weekAgo)).length ?? 0;

    return { total, returning, newThisWeek };
  } catch {
    return { total: 0, returning: 0, newThisWeek: 0 };
  }
}
