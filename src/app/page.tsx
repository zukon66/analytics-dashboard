import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getTopTables,
  getPeriodKPIs,
  getComparisonKPIs,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import DateFilterBar from "@/components/DateFilterBar";
import t from "@/lib/i18n";

export const revalidate = 60;

const VALID_PERIODS = ["today", "7d", "30d"];
const PERIOD_LABEL: Record<string, string> = { today: "Bugün", "7d": "Son 7 Gün", "30d": "Son 30 Gün" };

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-5 py-3 text-sm text-[#92400E]">
      <span className="material-symbols-outlined text-base">warning</span>
      <span>Veri yüklenirken sorun oluştu. Lütfen sayfayı yenileyin.</span>
      <span className="ml-auto text-[10px] font-mono opacity-50">{message.slice(0, 60)}</span>
    </div>
  );
}

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period = "today", date } = await searchParams;
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "today";
  const queryKey = isValidDate ? date : activePeriod;

  const [hourlyRes, cityRes, zoneRes, topTablesRes, kpisRes, prevKpisRes] = await Promise.all([
    getScansByHour(queryKey),
    getScansByCity(queryKey),
    getScansByZone(queryKey),
    getTopTables(10, queryKey),
    getPeriodKPIs(queryKey),
    getComparisonKPIs(queryKey),
  ]);

  const kpis = kpisRes.data;
  const prevKpis = prevKpisRes.data;
  const hasError = [hourlyRes, cityRes, zoneRes, topTablesRes, kpisRes].some((r) => r.error);
  const periodDisplayLabel = isValidDate ? date : (PERIOD_LABEL[activePeriod] ?? "Bugün");

  const kpiCards = [
    { label: `${periodDisplayLabel} Toplam Tarama`, value: kpis.totalScans.toLocaleString("tr-TR"), prev: prevKpis.totalScans, icon: "qr_code_scanner", iconBg: "bg-[#EEEAFE]", iconColor: "text-[#7C6CF6]" },
    { label: t.dashboard.kpis.peakHour, value: kpis.peakHour, prev: null, icon: "schedule", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]" },
    { label: t.dashboard.kpis.activeCities, value: kpis.activeCities.toString(), prev: prevKpis.activeCities, icon: "location_city", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]" },
    { label: t.dashboard.kpis.activeZones, value: kpis.activeZones.toString(), prev: prevKpis.activeZones, icon: "map", iconBg: "bg-[#F3F4F6]", iconColor: "text-[#6B7280]" },
  ];

  const zones = [
    { label: "Teras", tables: 24, color: "#7C6CF6" },
    { label: "İç Mekan", tables: 42, color: "#60A5FA" },
    { label: "Bar", tables: 12, color: "#A78BFA" },
    { label: "Bahçe", tables: 18, color: "#34D399" },
  ];

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">{t.dashboard.title}</h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.dashboard.subtitle}</p>
        </div>
        <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
      </div>

      {hasError && <ErrorBanner message={[hourlyRes, cityRes, zoneRes, topTablesRes, kpisRes].find((r) => r.error)?.error ?? ""} />}

      {/* KPI Şeridi */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
            <div className={`p-3 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-2xl font-extrabold text-[#1F2430]">{kpi.value}</p>
                {kpi.prev !== null && typeof kpi.prev === "number" && (
                  <DeltaBadge current={Number(kpi.value.replace(/\D/g, "")) || 0} previous={kpi.prev} />
                )}
              </div>
              <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter truncate">{kpi.label}</p>
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
          <CityScansChart data={cityRes.data} />
        </div>
      </div>

      {/* Grafikler Sıra 2 */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-4">
          <ZoneChart data={zoneRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-8 bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
          <div className="px-8 py-6 flex justify-between items-center border-b border-[#E9E9F2]">
            <h3 className="text-lg font-bold text-[#1F2430]">{t.dashboard.topTables.title}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span className="w-3 h-3 rounded-full bg-[#7C6CF6]"></span>{t.dashboard.topTables.highVol}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span className="w-3 h-3 rounded-full bg-[#E9E9F2]"></span>{t.dashboard.topTables.normal}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2]">
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.tableId}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.zone}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.dailyScans}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.avgDuration}</th>
                </tr>
              </thead>
              <tbody>
                {topTablesRes.data.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-[#9AA3B2] text-sm">{periodDisplayLabel} için henüz tarama verisi yok.</td></tr>
                ) : (
                  topTablesRes.data.map((table) => {
                    const maxScans = topTablesRes.data[0]?.scans ?? 1;
                    const pct = Math.round((table.scans / maxScans) * 100);
                    return (
                      <tr key={table.tableId} className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]">
                        <td className="px-8 py-5"><span className="font-bold text-[#1F2430]">{table.tableId}</span></td>
                        <td className="px-8 py-5"><span className="text-sm text-[#6B7280]">{table.zone}</span></td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F2430]">{table.scans}</span>
                            <div className="w-16 h-1 bg-[#E9E9F2] rounded-full overflow-hidden">
                              <div className="h-full bg-[#7C6CF6]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[#6B7280]">{table.avgDuration} {t.common.minutes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Zirve Saat Önerisi */}
      {kpis.totalScans > 0 && kpis.peakHour !== "--" && (
        <div className="bg-[#EEEAFE] border border-[#D4CFFE] rounded-xl px-8 py-5 mb-8 flex items-center gap-5">
          <span className="material-symbols-outlined text-[#7C6CF6] text-2xl shrink-0">lightbulb</span>
          <div>
            <p className="text-sm font-bold text-[#1F2430]">
              En yoğun saatiniz <span className="text-[#7C6CF6]">{kpis.peakHour}</span>
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Bu saatte ekstra garson veya kasa kapasitesi hazırlamanız hizmet kalitesini artırabilir.
            </p>
          </div>
        </div>
      )}

      {/* Bölge Envanteri */}
      <div className="bg-[#F6F6FB] rounded-xl p-8">
        <h3 className="text-lg font-bold text-[#1F2430] mb-6">{t.dashboard.inventory.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <div key={zone.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                <span className="text-sm font-semibold text-[#1F2430]">{zone.label}</span>
              </div>
              <span className="text-sm font-bold text-[#1F2430]">{zone.tables} {t.common.tables}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
