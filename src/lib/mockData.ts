import type {
  ActivationFunnel,
  Business,
  Customer,
  CustomerGrowthPoint,
  MrrPlanBreakdown,
  MrrTrendPoint,
  NewRegistration,
  Order,
  PlatformAverages,
  TrialExpiration,
} from "./queries";

type Scan = {
  id: number;
  business_id: number;
  table_id: string;
  zone: string;
  city: string;
  scanned_at: string;
  duration_minutes: number;
};

export const MOCK_START = "2026-05-02";
export const MOCK_END = "2026-05-31";

const DAY_MS = 86400000;
const zones = ["Salon", "Teras", "Paket", "Bahçe", "VIP"];
const cityPool = ["Silifke", "Mersin", "Tarsus", "Erdemli", "Mut", "Adana"];
const menuItems = [
  { name: "Mercimek Çorbası", category: "Çorbalar", price: 95 },
  { name: "Tavuk Şiş", category: "Ana Yemek", price: 260 },
  { name: "Adana Kebap", category: "Ana Yemek", price: 320 },
  { name: "Izgara Köfte", category: "Ana Yemek", price: 285 },
  { name: "Lahmacun", category: "Fırın", price: 120 },
  { name: "Çoban Salata", category: "Salatalar", price: 135 },
  { name: "Patates Kızartması", category: "Ara Sıcak", price: 110 },
  { name: "Humus", category: "Mezeler", price: 145 },
  { name: "Ayran", category: "İçecekler", price: 45 },
  { name: "Kola", category: "İçecekler", price: 65 },
  { name: "Künefe", category: "Tatlılar", price: 185 },
  { name: "Sütlaç", category: "Tatlılar", price: 120 },
];
const planFee: Record<Business["plan"], number> = {
  trial: 0,
  starter: 699,
  pro: 1499,
  enterprise: 3499,
};

export const mockBusinesses: Business[] = [
  { id: 1, name: "Akdeniz Sofrası", city: "Silifke", plan: "pro", status: "active", owner_email: "akdeniz@kokos.test", created_at: "2026-05-02T09:10:00", last_active_at: "2026-05-31T21:20:00" },
  { id: 2, name: "Göksu Bistro", city: "Silifke", plan: "starter", status: "active", owner_email: "goksu@kokos.test", created_at: "2026-05-03T11:35:00", last_active_at: "2026-05-30T19:05:00" },
  { id: 3, name: "Limon Cafe", city: "Mersin", plan: "trial", status: "trial", owner_email: "limon@kokos.test", created_at: "2026-05-08T13:20:00", last_active_at: "2026-05-29T18:15:00" },
  { id: 4, name: "Taşucu Marina", city: "Taşucu", plan: "enterprise", status: "active", owner_email: "marina@kokos.test", created_at: "2026-05-04T10:00:00", last_active_at: "2026-05-31T22:00:00" },
  { id: 5, name: "Narlıkuyu Meze", city: "Narlıkuyu", plan: "pro", status: "active", owner_email: "meze@kokos.test", created_at: "2026-05-11T12:45:00", last_active_at: "2026-05-31T20:35:00" },
  { id: 6, name: "Mersin Burger Lab", city: "Mersin", plan: "starter", status: "inactive", owner_email: "burger@kokos.test", created_at: "2026-05-05T08:30:00", last_active_at: "2026-05-12T14:00:00" },
  { id: 7, name: "Tarsus Ocakbaşı", city: "Tarsus", plan: "enterprise", status: "active", owner_email: "ocakbasi@kokos.test", created_at: "2026-05-14T16:10:00", last_active_at: "2026-05-30T23:15:00" },
  { id: 8, name: "Erdemli Vegan", city: "Erdemli", plan: "trial", status: "trial", owner_email: "vegan@kokos.test", created_at: "2026-05-20T09:55:00", last_active_at: "2026-05-28T17:40:00" },
  { id: 9, name: "Mut Kahvaltı Evi", city: "Mut", plan: "starter", status: "inactive", owner_email: "kahvalti@kokos.test", created_at: "2026-05-02T07:50:00", last_active_at: "2026-05-10T10:15:00" },
  { id: 10, name: "Kızkalesi Balık", city: "Mersin", plan: "pro", status: "churned", owner_email: "balik@kokos.test", created_at: "2026-05-06T15:25:00", last_active_at: "2026-05-09T12:05:00" },
];

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function trDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", { weekday: "short" });
}

function rangeForPeriod(period: string): { from: Date; to: Date } {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return { from: new Date(`${period}T00:00:00`), to: new Date(`${period}T23:59:59`) };
  }
  if (period === "7d") return { from: new Date("2026-05-25T00:00:00"), to: new Date("2026-05-31T23:59:59") };
  if (period === "30d") return { from: new Date("2026-05-02T00:00:00"), to: new Date("2026-05-31T23:59:59") };
  return { from: new Date("2026-05-31T00:00:00"), to: new Date("2026-05-31T23:59:59") };
}

function inPeriod(date: string, period: string): boolean {
  const { from, to } = rangeForPeriod(period);
  const d = new Date(date);
  return d >= from && d <= to;
}

const scans: Scan[] = [];
let scanId = 1;
for (let day = 2; day <= 31; day++) {
  for (const biz of mockBusinesses) {
    if (new Date(biz.created_at) > new Date(`2026-05-${String(day).padStart(2, "0")}T23:59:59`)) continue;
    if (biz.status === "churned" && day > 9) continue;
    if (biz.status === "inactive" && day > (biz.id === 6 ? 12 : 10)) continue;
    const base = biz.plan === "enterprise" ? 18 : biz.plan === "pro" ? 13 : biz.plan === "starter" ? 8 : 5;
    const weekendBoost = [0, 6].includes(new Date(`2026-05-${String(day).padStart(2, "0")}T12:00:00`).getDay()) ? 6 : 0;
    const count = base + weekendBoost + ((day + biz.id * 3) % 7);
    for (let i = 0; i < count; i++) {
      const hour = 9 + ((i * 3 + day + biz.id) % 14);
      const minute = (i * 11 + biz.id * 7) % 60;
      scans.push({
        id: scanId++,
        business_id: biz.id,
        table_id: `M${String(((i + day + biz.id) % 24) + 1).padStart(2, "0")}`,
        zone: zones[(i + biz.id + day) % zones.length],
        city: biz.city === "Taşucu" || biz.city === "Narlıkuyu" ? "Silifke" : biz.city,
        scanned_at: `2026-05-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        duration_minutes: 3 + ((i + day + biz.id) % 18),
      });
    }
  }
}

function buildOrderItems(seed: number) {
  const itemCount = 2 + (seed % 4);
  const start = seed % menuItems.length;
  return Array.from({ length: itemCount }, (_, index) => {
    const menuItem = menuItems[(start + index) % menuItems.length];
    const quantity = 1 + ((seed + index) % 3 === 0 ? 1 : 0);
    const total = menuItem.price * quantity;
    return {
      name: menuItem.name,
      category: menuItem.category,
      quantity,
      unit_price: menuItem.price,
      total,
    };
  });
}

const orders: Order[] = scans
  .filter((scan) => scan.id % 4 === 0 || scan.duration_minutes > 15)
  .map((scan, index) => {
    const createdAt = scan.scanned_at.replace(/:(\d{2})$/, ":30");
    const isLatestServiceDay = createdAt.startsWith("2026-05-31");
    const isRecentHour = new Date(createdAt).getHours() >= 18;
    const items = buildOrderItems(scan.id + index);

    return {
      id: 1000 + index,
      table_id: scan.table_id,
      zone: scan.zone,
      total_amount: items.reduce((sum, item) => sum + item.total, 0),
      status: scan.id % 17 === 0 ? "cancelled" : isLatestServiceDay && isRecentHour && scan.id % 7 === 0 ? "pending" : "completed",
      created_at: createdAt,
      items,
    };
  });

const customers: Customer[] = Array.from({ length: 96 }, (_, i) => {
  const day = 2 + (i % 30);
  const city = cityPool[i % cityPool.length];
  return {
    id: i + 1,
    name: `Demo Müşteri ${String(i + 1).padStart(2, "0")}`,
    city,
    visit_count: 1 + ((i * 5) % 9),
    last_visit: `2026-05-${String(day).padStart(2, "0")}T${String(10 + (i % 12)).padStart(2, "0")}:15:00`,
  };
});

function filterScans(period = "today", businessId?: number): Scan[] {
  return scans.filter((scan) => inPeriod(scan.scanned_at, period) && (!businessId || scan.business_id === businessId));
}

function filterOrders(search = "", businessId?: number, period?: string): Order[] {
  const businessScanIds = businessId ? new Set(scans.filter((s) => s.business_id === businessId).map((s) => s.table_id + s.scanned_at.slice(0, 13))) : null;
  return orders.filter((order) => {
    const matchesBusiness = !businessScanIds || businessScanIds.has(order.table_id + order.created_at.slice(0, 13));
    const q = search.toLocaleLowerCase("tr-TR");
    const matchesSearch = !q || order.table_id.toLocaleLowerCase("tr-TR").includes(q) || order.zone.toLocaleLowerCase("tr-TR").includes(q);
    const matchesPeriod = !period || inPeriod(order.created_at, period);
    return matchesBusiness && matchesSearch && matchesPeriod;
  });
}

export function mockGetBusinesses(search = ""): Business[] {
  const q = search.toLocaleLowerCase("tr-TR");
  return mockBusinesses.filter((b) => !q || [b.name, b.city, b.owner_email ?? ""].some((v) => v.toLocaleLowerCase("tr-TR").includes(q)));
}

export function mockGetBusinessById(id: number): Business | null {
  return mockBusinesses.find((b) => b.id === id) ?? null;
}

export function mockGetPlatformKPIs() {
  const weekScans = filterScans("7d");
  const todayScans = filterScans("today");
  return {
    totalBusinesses: mockBusinesses.length,
    activeBusinesses: mockBusinesses.filter((b) => b.status === "active").length,
    churnRiskCount: mockGetChurnRiskBusinesses(14).length,
    totalScansToday: todayScans.length,
    totalScansWeek: weekScans.length,
    totalRevenueAllTime: orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total_amount, 0),
  };
}

export function mockGetChurnRiskBusinesses(inactiveDays = 14): Array<Business & { daysSinceActive: number }> {
  const end = new Date("2026-05-31T23:59:59").getTime();
  return mockBusinesses
    .map((b) => ({
      ...b,
      daysSinceActive: b.last_active_at ? Math.floor((end - new Date(b.last_active_at).getTime()) / DAY_MS) : 999,
    }))
    .filter((b) => b.status !== "churned" && b.daysSinceActive >= inactiveDays);
}

export function mockGetBusinessScanCounts(businessIds: number[], days = 7): Record<number, number> {
  const from = new Date(new Date("2026-05-31T23:59:59").getTime() - days * DAY_MS);
  const counts: Record<number, number> = {};
  for (const scan of scans) {
    if (businessIds.includes(scan.business_id) && new Date(scan.scanned_at) >= from) {
      counts[scan.business_id] = (counts[scan.business_id] ?? 0) + 1;
    }
  }
  return counts;
}

export function mockGetScansByHour(period = "today", businessId?: number) {
  const hourMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = 0;
  for (const scan of filterScans(period, businessId)) {
    const hour = new Date(scan.scanned_at).getHours();
    hourMap[hour] += 1;
  }
  return Object.entries(hourMap).map(([hour, count]) => ({ hour: `${hour.padStart(2, "0")}:00`, scans: count }));
}

export function mockGetScansByCity(period = "7d", businessId?: number) {
  const map: Record<string, number> = {};
  for (const scan of filterScans(period, businessId)) map[scan.city] = (map[scan.city] ?? 0) + 1;
  return Object.entries(map).map(([city, count]) => ({ city, scans: count })).sort((a, b) => b.scans - a.scans).slice(0, 8);
}

export function mockGetScansByPlan(period = "7d") {
  const map: Record<string, number> = {};
  const labels: Record<string, string> = { enterprise: "Enterprise", pro: "Pro", starter: "Starter", trial: "Deneme" };
  for (const scan of filterScans(period)) {
    const plan = mockGetBusinessById(scan.business_id)?.plan ?? "trial";
    map[plan] = (map[plan] ?? 0) + 1;
  }
  return Object.entries(map).map(([plan, count]) => ({ zone: labels[plan] ?? plan, scans: count })).sort((a, b) => b.scans - a.scans);
}

export function mockGetScansByZone(period = "today", businessId?: number) {
  const map: Record<string, number> = {};
  for (const scan of filterScans(period, businessId)) map[scan.zone] = (map[scan.zone] ?? 0) + 1;
  return Object.entries(map).map(([zone, count]) => ({ zone, scans: count }));
}

export function mockGetTopTables(limit = 10, period = "today", businessId?: number) {
  const map: Record<string, { zone: string; scans: number; totalDuration: number }> = {};
  for (const scan of filterScans(period, businessId)) {
    map[scan.table_id] ??= { zone: scan.zone, scans: 0, totalDuration: 0 };
    map[scan.table_id].scans += 1;
    map[scan.table_id].totalDuration += scan.duration_minutes;
  }
  return Object.entries(map)
    .map(([tableId, stat]) => ({ tableId, zone: stat.zone, scans: stat.scans, avgDuration: Math.round(stat.totalDuration / stat.scans) }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, limit);
}

export function mockGetPeriodKPIs(period = "today", businessId?: number) {
  const rows = filterScans(period, businessId);
  const hourMap: Record<number, number> = {};
  for (const scan of rows) hourMap[new Date(scan.scanned_at).getHours()] = (hourMap[new Date(scan.scanned_at).getHours()] ?? 0) + 1;
  const peak = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    totalScans: rows.length,
    peakHour: peak ? `${peak.padStart(2, "0")}:00` : "--",
    activeCities: new Set(rows.map((r) => r.city)).size,
    activeZones: new Set(rows.map((r) => r.zone)).size,
  };
}

export function mockGetWeeklyStats(businessId?: number) {
  const rows = filterScans("7d", businessId);
  const map: Record<string, number> = {};
  for (let day = 25; day <= 31; day++) {
    const key = `2026-05-${day}`;
    map[trDay(key)] = 0;
  }
  for (const scan of rows) map[trDay(dateKey(new Date(scan.scanned_at)))] = (map[trDay(dateKey(new Date(scan.scanned_at)))] ?? 0) + 1;
  const dailyData = Object.entries(map).map(([day, count]) => ({ day, scans: count }));
  const bestDay = dailyData.reduce((max, d) => (d.scans > max.scans ? d : max), dailyData[0] ?? { day: "--", scans: 0 });
  return { total: rows.length, avgPerDay: Math.round(rows.length / 7), bestDay: bestDay.day, dailyData };
}

export function mockGetOrders(limit = 50, sortBy = "created_at", sortDir: "asc" | "desc" = "desc", search = "", businessId?: number, period?: string): Order[] {
  const rows = [...filterOrders(search, businessId, period)];
  rows.sort((a, b) => {
    const av = a[sortBy as keyof Order] ?? a.created_at;
    const bv = b[sortBy as keyof Order] ?? b.created_at;
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });
  return rows.slice(0, limit);
}

export function mockGetOrderStats(businessId?: number, period?: string) {
  const rows = filterOrders("", businessId, period);
  const totalRevenue = rows.reduce((s, o) => s + o.total_amount, 0);
  const completed = rows.filter((o) => o.status === "completed").length;
  const pending = rows.filter((o) => o.status === "pending").length;
  const cancelled = rows.filter((o) => o.status === "cancelled").length;
  return { totalRevenue, completed, pending, cancelled, avgAmount: Math.round(totalRevenue / Math.max(rows.length, 1)), cancelRate: Math.round((cancelled / Math.max(rows.length, 1)) * 100) };
}

export function mockGetTopMenuItems(limit = 10, businessId?: number, period?: string) {
  const orderRows = filterOrders("", businessId, period).filter((o) => o.status !== "cancelled");
  const map: Record<string, { name: string; category: string; count: number; revenue: number }> = {};
  for (const order of orderRows) {
    for (const item of order.items ?? []) {
      map[item.name] ??= { name: item.name, category: item.category, count: 0, revenue: 0 };
      map[item.name].count += item.quantity;
      map[item.name].revenue += item.total;
    }
  }
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function mockGetRevenueByDay(days = 14, businessId?: number) {
  const end = new Date("2026-05-31T23:59:59");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end.getTime() - (days - 1 - i) * DAY_MS);
    const key = dateKey(d);
    const dayOrders = filterOrders("", businessId).filter(
      (o) => o.status !== "cancelled" && o.created_at.startsWith(key)
    );
    return {
      date: key,
      revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
      orders: dayOrders.length,
    };
  });
}

export function mockGetRevenueByZone(businessId?: number) {
  const orderRows = filterOrders("", businessId).filter((o) => o.status !== "cancelled");
  const map: Record<string, { zone: string; revenue: number; orders: number }> = {};
  for (const order of orderRows) {
    map[order.zone] ??= { zone: order.zone, revenue: 0, orders: 0 };
    map[order.zone].revenue += order.total_amount;
    map[order.zone].orders += 1;
  }
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

export function mockGetConversionRate(businessId?: number) {
  const scanCount = businessId ? scans.filter((s) => s.business_id === businessId).length : scans.length;
  const orderCount = filterOrders("", businessId).length;
  return { scanCount, orderCount, rate: Math.round((orderCount / Math.max(scanCount, 1)) * 100) };
}

export function mockGetCustomers(limit = 20, offset = 0, search = "", businessId?: number): Customer[] {
  const q = search.toLocaleLowerCase("tr-TR");
  const rows = customers
    .filter((c) => !q || c.name.toLocaleLowerCase("tr-TR").includes(q) || c.city.toLocaleLowerCase("tr-TR").includes(q))
    .filter((_, idx) => !businessId || idx % mockBusinesses.length === businessId - 1)
    .sort((a, b) => b.visit_count - a.visit_count);
  return rows.slice(offset, offset + limit);
}

export function mockGetCustomerStats(businessId?: number) {
  const rows = mockGetCustomers(1000, 0, "", businessId);
  return { total: rows.length, returning: rows.filter((c) => c.visit_count > 1).length, newThisWeek: rows.filter((c) => new Date(c.last_visit) >= new Date("2026-05-25T00:00:00")).length };
}

export function mockGetCustomerCount(search = "", businessId?: number): number {
  return mockGetCustomers(1000, 0, search, businessId).length;
}

export function mockGetTablePerformance(search = "", businessId?: number) {
  const q = search.toLocaleLowerCase("tr-TR");
  const scanRows = scans.filter((scan) => !businessId || scan.business_id === businessId);
  const orderRows = filterOrders("", businessId);
  const orderMap: Record<string, Order[]> = {};

  for (const order of orderRows) {
    orderMap[order.table_id] ??= [];
    orderMap[order.table_id].push(order);
  }

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

  for (const scan of scanRows) {
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
    row.totalDuration += scan.duration_minutes;
    row.lastActivity = scan.scanned_at > row.lastActivity ? scan.scanned_at : row.lastActivity;
    const hour = new Date(scan.scanned_at).getHours();
    row.hourly[hour] = (row.hourly[hour] ?? 0) + 1;
  }

  for (const [tableId, rows] of Object.entries(orderMap)) {
    map[tableId] ??= {
      tableId,
      zone: rows[0]?.zone ?? "Salon",
      scans: 0,
      totalDuration: 0,
      orders: 0,
      revenue: 0,
      lastActivity: rows[0]?.created_at ?? "2026-05-31T00:00:00",
      hourly: {},
    };
    const row = map[tableId];
    row.orders += rows.length;
    row.revenue += rows.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total_amount, 0);
    for (const order of rows) {
      row.lastActivity = order.created_at > row.lastActivity ? order.created_at : row.lastActivity;
    }
  }

  return Object.values(map)
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
    .filter((row) => !q || row.tableId.toLocaleLowerCase("tr-TR").includes(q) || row.zone.toLocaleLowerCase("tr-TR").includes(q))
    .sort((a, b) => b.revenue - a.revenue);
}

export function mockGetTableDetail(tableId: string, businessId?: number) {
  const normalizedTableId = decodeURIComponent(tableId);
  const scanRows = scans
    .filter((scan) => scan.table_id === normalizedTableId && (!businessId || scan.business_id === businessId))
    .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at));
  const orderRows = filterOrders("", businessId)
    .filter((order) => order.table_id === normalizedTableId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const performance = mockGetTablePerformance("", businessId).find((table) => table.tableId === normalizedTableId);

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    scans: scanRows.filter((scan) => new Date(scan.scanned_at).getHours() === hour).length,
    orders: orderRows.filter((order) => new Date(order.created_at).getHours() === hour).length,
  }));

  const statusBreakdown = {
    completed: orderRows.filter((order) => order.status === "completed").length,
    pending: orderRows.filter((order) => order.status === "pending").length,
    cancelled: orderRows.filter((order) => order.status === "cancelled").length,
  };

  const zone = performance?.zone ?? scanRows[0]?.zone ?? orderRows[0]?.zone ?? "Salon";
  const revenue = orderRows
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total_amount, 0);

  return {
    summary: performance ?? {
      tableId: normalizedTableId,
      zone,
      scans: scanRows.length,
      orders: orderRows.length,
      revenue,
      avgAmount: Math.round(revenue / Math.max(orderRows.length, 1)),
      avgDuration: Math.round(scanRows.reduce((sum, scan) => sum + scan.duration_minutes, 0) / Math.max(scanRows.length, 1)),
      conversionRate: Math.round((orderRows.length / Math.max(scanRows.length, 1)) * 100),
      peakHour: hourly.sort((a, b) => b.scans - a.scans)[0]?.hour ?? "--",
      lastActivity: scanRows[0]?.scanned_at ?? orderRows[0]?.created_at ?? "2026-05-31T00:00:00",
    },
    hourly: hourly.sort((a, b) => b.scans + b.orders - (a.scans + a.orders)).slice(0, 8),
    statusBreakdown,
    recentOrders: orderRows.slice(0, 12),
    recentScans: scanRows.slice(0, 8).map((scan) => ({
      id: scan.id,
      scanned_at: scan.scanned_at,
      duration_minutes: scan.duration_minutes,
      zone: scan.zone,
    })),
  };
}

export function mockGetMrrTrend(): MrrTrendPoint[] {
  const labels = ["Haz 2025", "Tem 2025", "Ağu 2025", "Eyl 2025", "Eki 2025", "Kas 2025", "Ara 2025", "Oca 2026", "Şub 2026", "Mar 2026", "Nis 2026", "May 2026"];
  return labels.map((label, i) => ({ month_label: label, month_start: `${i < 7 ? 2025 : 2026}-${String(((i + 5) % 12) + 1).padStart(2, "0")}-01`, revenue: 5200 + i * 1450 + (i % 3) * 700 }));
}

export function mockGetCurrentMrr(): { totalMrr: number; breakdown: MrrPlanBreakdown[] } {
  const breakdown = (["enterprise", "pro", "starter", "trial"] as const).map((plan) => {
    const business_count = mockBusinesses.filter((b) => b.plan === plan && b.status !== "churned").length;
    return { plan, business_count, plan_fee: planFee[plan], plan_mrr: business_count * planFee[plan] };
  });
  return { totalMrr: breakdown.reduce((s, r) => s + r.plan_mrr, 0), breakdown };
}

export function mockGetTrialExpirations(warningDays = 14): TrialExpiration[] {
  return mockBusinesses
    .filter((b) => b.plan === "trial")
    .map((b, index) => ({ ...b, trial_ends_at: `2026-06-${String(index + 4).padStart(2, "0")}T23:59:59`, days_remaining: index + 4 }))
    .filter((b) => b.days_remaining <= warningDays);
}

export function mockGetNewRegistrations(lookbackDays = 30): NewRegistration[] {
  const from = new Date(new Date("2026-05-31T23:59:59").getTime() - lookbackDays * DAY_MS);
  return mockBusinesses
    .filter((b) => new Date(b.created_at) >= from)
    .map((b) => ({ ...b, has_first_scan: scans.some((s) => s.business_id === b.id) }));
}

export function mockGetActivationFunnel(): ActivationFunnel {
  const activated = mockBusinesses.filter((b) => scans.some((s) => s.business_id === b.id)).length;
  // Güçlü kullanıcı: son 7 günde (Mayıs 25-31) 10+ tarama alan işletmeler
  const recentFrom = new Date("2026-05-25T00:00:00");
  const recentTo   = new Date("2026-05-31T23:59:59");
  const recentCount: Record<number, number> = {};
  for (const s of scans) {
    const d = new Date(s.scanned_at);
    if (d >= recentFrom && d <= recentTo)
      recentCount[s.business_id] = (recentCount[s.business_id] ?? 0) + 1;
  }
  const power = mockBusinesses.filter((b) => (recentCount[b.id] ?? 0) >= 10).length;
  return { totalBusinesses: mockBusinesses.length, activated1Plus: activated, powerUsers10Plus: power };
}

export function mockGetPlatformAverages(period = "7d"): PlatformAverages {
  const activeCount = Math.max(mockBusinesses.filter((b) => b.status !== "churned").length, 1);
  const periodScans = filterScans(period);
  return {
    avgScans: Math.round(periodScans.length / activeCount),
    avgRevenue: Math.round(mockGetOrderStats().totalRevenue / activeCount),
    avgCustomers: Math.round(customers.length / activeCount),
  };
}

export function mockGetDailyScanCounts(days = 14) {
  const end = new Date("2026-05-31T12:00:00");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end.getTime() - (days - 1 - i) * DAY_MS);
    const key = dateKey(d);
    return { date: key, scans: filterScans(key).length };
  });
}

export function mockGetCustomerGrowthTrend(granularity: "weekly" | "monthly" = "weekly"): CustomerGrowthPoint[] {
  if (granularity === "monthly") {
    return ["Ara", "Oca", "Şub", "Mar", "Nis", "May"].map((label, i) => ({ label, newCustomers: 18 + i * 7 + (i % 2) * 4 }));
  }
  return ["6 Nis", "13 Nis", "20 Nis", "27 Nis", "4 May", "11 May", "18 May", "25 May"].map((label, i) => ({ label, newCustomers: 6 + i * 3 + (i % 3) * 2 }));
}

export function hasRows<T>(data: T[] | null | undefined): data is T[] {
  return Array.isArray(data) && data.length > 0;
}
