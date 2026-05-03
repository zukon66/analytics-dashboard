import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getBusinessById,
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getTopTables,
  getPeriodKPIs,
  getComparisonKPIs,
  getOrderStats,
  getCustomerStats,
  getPlatformAverages,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityMapChart from "@/components/charts/CityMapChart";
import ZoneChart from "@/components/charts/ZoneChart";
import DateFilterBar from "@/components/DateFilterBar";
import PlatformComparisonBadge from "@/components/PlatformComparisonBadge";
import t from "@/lib/i18n";

export const revalidate = 60;

const VALID_PERIODS = ["today", "7d", "30d"];
const PERIOD_LABEL: Record<string, string> = { today: "Bugün", "7d": "Son 7 Gün", "30d": "Son 30 Gün" };

const PLAN_COLORS: Record<string, string> = {
  trial:      "bg-[#F3F4F6] text-[#6B7280]",
  starter:    "bg-[#DBEAFE] text-[#1E40AF]",
  pro:        "bg-[#EDE9FE] text-[#6D28D9]",
  enterprise: "bg-[#FEF3C7] text-[#92400E]",
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-[#DCFCE7] text-[#15803D]",
  inactive: "bg-[#FEF3C7] text-[#92400E]",
  churned:  "bg-[#FEE2E2] text-[#991B1B]",
  trial:    "bg-[#F3F4F6] text-[#6B7280]",
};

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
      {up ? "↑" : "↓"} %{Math.abs(pct)}
    </span>
  );
}

export default async function BusinessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { id } = await params;
  const businessId = Number(id);
  if (isNaN(businessId)) notFound();

  const { data: business } = await getBusinessById(businessId);
  if (!business) notFound();

  const { period = "7d", date } = await searchParams;
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "7d";
  const queryKey = isValidDate ? date : activePeriod;

  const [hourlyRes, cityRes, zoneRes, topTablesRes, kpisRes, prevKpisRes, orderStatsRes, customerStatsRes, platformAvgRes] =
    await Promise.all([
      getScansByHour(queryKey, businessId),
      getScansByCity(queryKey, businessId),
      getScansByZone(queryKey, businessId),
      getTopTables(10, queryKey, businessId),
      getPeriodKPIs(queryKey, businessId),
      getComparisonKPIs(queryKey, businessId),
      getOrderStats(businessId),
      getCustomerStats(businessId),
      getPlatformAverages(activePeriod),
    ]);
  const platformAvg = platformAvgRes.data;

  const kpis = kpisRes.data;
  const prevKpis = prevKpisRes.data;
  const periodDisplayLabel = isValidDate ? date : (PERIOD_LABEL[activePeriod] ?? "Son 7 Gün");

  const kpiCards = [
    { label: `${periodDisplayLabel} Tarama`, value: kpis.totalScans.toLocaleString("tr-TR"), prev: prevKpis.totalScans, icon: "qr_code_scanner", iconBg: "bg-[var(--accent-bg)]", iconColor: "text-[#7C6CF6]", platformBizValue: kpis.totalScans, platformAvg: platformAvg.avgScans },
    { label: t.dashboard.kpis.peakHour, value: kpis.peakHour, prev: null, icon: "schedule", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]", platformBizValue: null, platformAvg: 0 },
    { label: "Toplam Gelir", value: `₺${orderStatsRes.data.totalRevenue.toLocaleString("tr-TR")}`, prev: null, icon: "payments", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]", platformBizValue: orderStatsRes.data.totalRevenue, platformAvg: platformAvg.avgRevenue },
    { label: "Toplam Müşteri", value: String(customerStatsRes.data.total), prev: null, icon: "group", iconBg: "bg-[var(--bg-sidebar)]", iconColor: "text-[var(--text-2)]", platformBizValue: customerStatsRes.data.total, platformAvg: platformAvg.avgCustomers },
  ];

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Geri + Başlık */}
      <div className="mb-8">
        <Link href="/businesses" className="text-xs text-[#7C6CF6] font-semibold flex items-center gap-1 mb-4 hover:underline w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Tüm İşletmeler
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl kok-icon-tile flex items-center justify-center text-[var(--accent)] font-extrabold text-lg">
                {business.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-1)]">{business.name}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[business.plan] ?? ""}`}>
                    {business.plan}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[business.status] ?? ""}`}>
                    {t.businesses.status[business.status as keyof typeof t.businesses.status] ?? business.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-2)]">{business.city} · {business.owner_email ?? "—"}</p>
              </div>
            </div>
          </div>
          <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
        </div>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="kok-card kok-card-hover rounded-3xl p-5 flex items-center gap-4">
            <div className={`kok-icon-tile p-3 rounded-2xl ${kpi.iconBg} ${kpi.iconColor}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xl font-extrabold text-[var(--text-1)]">{kpi.value}</p>
                {kpi.prev !== null && typeof kpi.prev === "number" && (
                  <DeltaBadge current={Number(String(kpi.value).replace(/\D/g, "")) || 0} previous={kpi.prev} />
                )}
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter truncate">{kpi.label}</p>
              {kpi.platformBizValue !== null && (
                <PlatformComparisonBadge bizValue={kpi.platformBizValue} platformAvg={kpi.platformAvg} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler Sıra 1 */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <HourlyScansChart data={hourlyRes.data} period={queryKey} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CityMapChart data={cityRes.data} />
        </div>
      </div>

      {/* Grafikler Sıra 2 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <ZoneChart data={zoneRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-8 kok-card rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text-1)]">{t.dashboard.topTables.title}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.tableId}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.zone}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.dailyScans}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.avgDuration}</th>
                </tr>
              </thead>
              <tbody>
                {topTablesRes.data.length === 0 ? (
                  <tr><td colSpan={4} className="kok-empty px-8 py-12 text-center text-[var(--text-muted)] text-sm">{periodDisplayLabel} için tarama verisi yok.</td></tr>
                ) : (
                  topTablesRes.data.map((table) => {
                    const maxScans = topTablesRes.data[0]?.scans ?? 1;
                    const pct = Math.round((table.scans / maxScans) * 100);
                    return (
                      <tr key={table.tableId} className="hover:bg-white/[0.035] transition-colors border-t border-[var(--border)]">
                        <td className="px-8 py-5"><span className="font-bold text-[var(--text-1)]">{table.tableId}</span></td>
                        <td className="px-8 py-5"><span className="text-sm text-[var(--text-2)]">{table.zone}</span></td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-1)]">{table.scans}</span>
                            <div className="w-16 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full bg-[#7C6CF6]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[var(--text-2)]">{table.avgDuration} {t.common.minutes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
