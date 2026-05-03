import Link from "next/link";
import { getCurrentBusiness, trialDaysLeft } from "@/lib/business-session";
import {
  getConversionRate,
  getOrderStats,
  getPeriodKPIs,
  getRevenueByDay,
  getScansByHour,
  getScansByZone,
  getTopMenuItems,
  getTopTables,
  getWeeklyStats,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import RevenueTrendChart from "@/components/charts/RevenueTrendChart";

export const revalidate = 60;

function MetricCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
      <div className="kok-icon-tile p-3 rounded-2xl text-[var(--accent)]">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-extrabold ${accent ? "text-[var(--accent)]" : "text-[var(--text-1)]"}`}>
          {value}
        </p>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Ana Yemek": "#7C6CF6",
  "İçecekler": "#22d3ee",
  "Tatlılar": "#f472b6",
  "Çorbalar": "#fb923c",
  "Salatalar": "#4ade80",
  "Mezeler": "#a78bfa",
  "Ara Sıcak": "#fbbf24",
  "Fırın": "#f87171",
};

export default async function BusinessPortalPage() {
  const business = await getCurrentBusiness();
  const businessId = Number(business.id);

  const [periodRes, weeklyRes, hourlyRes, zoneRes, tablesRes, orderRes, conversionRes, topItemsRes, revenueRes] =
    await Promise.all([
      getPeriodKPIs("today", businessId),
      getWeeklyStats(businessId),
      getScansByHour("7d", businessId),
      getScansByZone("today", businessId),
      getTopTables(6, "7d", businessId),
      getOrderStats(businessId),
      getConversionRate(businessId),
      getTopMenuItems(8, businessId),
      getRevenueByDay(14, businessId),
    ]);

  const trialLeft = trialDaysLeft(business);
  const topItems = topItemsRes.data;
  const maxCount = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            İşletme Paneli
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">{business.name}</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.city} · {business.plan.toUpperCase()} planı
            {trialLeft !== null ? ` · Trial kalan ${trialLeft} gün` : ""}
          </p>
        </div>
        <Link
          href="/portal/settings"
          className="kok-gradient-button text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          Ayarlar
        </Link>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon="qr_code_scanner"
          label="Bugünkü Tarama"
          value={periodRes.data.totalScans.toLocaleString("tr-TR")}
          sub={`Zirve: ${periodRes.data.peakHour}`}
        />
        <MetricCard
          icon="calendar_month"
          label="Haftalık Tarama"
          value={weeklyRes.data.total.toLocaleString("tr-TR")}
          sub={`${weeklyRes.data.avgPerDay} / gün ortalama`}
        />
        <MetricCard
          icon="payments"
          label="Toplam Ciro"
          value={`₺${orderRes.data.totalRevenue.toLocaleString("tr-TR")}`}
          sub={`Ort. hesap ₺${orderRes.data.avgAmount.toLocaleString("tr-TR")}`}
        />
        <MetricCard
          icon="swap_horiz"
          label="Dönüşüm"
          value={`%${conversionRes.data.rate}`}
          sub={`${conversionRes.data.orderCount} sipariş / ${conversionRes.data.scanCount} tarama`}
          accent
        />
      </div>

      {/* Ciro Trendi */}
      <div className="mb-8">
        <RevenueTrendChart
          data={revenueRes.data}
          title="Günlük Ciro Trendi"
          subtitle="Son 14 günün sipariş cirosuna göre"
        />
      </div>

      {/* Tarama Grafiği */}
      <div className="mb-8">
        <HourlyScansChart data={hourlyRes.data} period="7d" />
      </div>

      {/* En Çok Sipariş Edilen + Bölge Analizi */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Top Menu Items */}
        <section className="kok-card rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-1)]">En Çok Sipariş Edilen</h2>
              <p className="text-sm text-[var(--text-2)] mt-1">Tüm zamanlar · adet bazında</p>
            </div>
            <Link
              href="/portal/orders"
              className="kok-soft-button rounded-full px-3 py-1.5 text-xs font-bold text-[var(--accent)]"
            >
              Siparişlere Git
            </Link>
          </div>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div key={item.name} className="grid grid-cols-[24px_1fr_72px] items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)] text-right">{idx + 1}</span>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-[var(--text-1)] truncate">{item.name}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: CATEGORY_COLORS[item.category] ?? "#9AA3B2",
                        background: `${CATEGORY_COLORS[item.category] ?? "#9AA3B2"}18`,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(8, Math.round((item.count / maxCount) * 100))}%`,
                        background: CATEGORY_COLORS[item.category] ?? "#7C6CF6",
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--text-1)]">{item.count}x</p>
                  <p className="text-[10px] text-[var(--text-muted)]">₺{item.revenue.toLocaleString("tr-TR")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Zone + Top Tables */}
        <div className="space-y-6">
          <ZoneChart
            data={zoneRes.data}
            title="Bölgeye Göre Tarama"
            subtitle="Bugünkü QR taramaları"
            totalLabel="Toplam Tarama"
          />
          <section className="kok-card rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text-1)]">En Aktif Masalar</h2>
              <p className="text-xs text-[var(--text-2)] mt-0.5">Son 7 gün</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {tablesRes.data.slice(0, 5).map((table) => (
                <Link
                  key={table.tableId}
                  href={`/portal/customers/${encodeURIComponent(table.tableId)}`}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/[0.035] transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-[var(--text-1)]">{table.tableId}</p>
                    <p className="text-xs text-[var(--text-muted)]">{table.zone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--accent)]">{table.scans} tarama</p>
                    <p className="text-xs text-[var(--text-muted)]">{table.avgDuration} dk ort.</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
