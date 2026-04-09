import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getTopTables,
  getPeriodKPIs,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import DateFilterBar from "@/components/DateFilterBar";
import t from "@/lib/i18n";

export const revalidate = 60;

const VALID_PERIODS = ["today", "7d", "30d"];

const PERIOD_LABEL: Record<string, string> = {
  today: "Bugün",
  "7d": "Son 7 Gün",
  "30d": "Son 30 Gün",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period = "today", date } = await searchParams;

  // Özel tarih varsa onu kullan, yoksa period doğrula
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "today";
  const queryKey = isValidDate ? date : activePeriod;

  const [hourlyData, cityData, zoneData, topTables, kpis] = await Promise.all([
    getScansByHour(queryKey),
    getScansByCity(queryKey),
    getScansByZone(queryKey),
    getTopTables(10, queryKey),
    getPeriodKPIs(queryKey),
  ]);

  const periodDisplayLabel = isValidDate
    ? date
    : (PERIOD_LABEL[activePeriod] ?? "Bugün");

  const kpiCards = [
    {
      label: `${periodDisplayLabel} Toplam Tarama`,
      value: kpis.totalScans.toLocaleString("tr-TR"),
      icon: "qr_code_scanner",
      iconBg: "bg-[#EEEAFE]",
      iconColor: "text-[#7C6CF6]",
    },
    {
      label: t.dashboard.kpis.peakHour,
      value: kpis.peakHour,
      icon: "schedule",
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#1E40AF]",
    },
    {
      label: t.dashboard.kpis.activeCities,
      value: kpis.activeCities.toString(),
      icon: "location_city",
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#6D28D9]",
    },
    {
      label: t.dashboard.kpis.activeZones,
      value: kpis.activeZones.toString(),
      icon: "map",
      iconBg: "bg-[#F3F4F6]",
      iconColor: "text-[#6B7280]",
    },
  ];

  const zones = [
    { label: "Teras", tables: 24, color: "#7C6CF6" },
    { label: "İç Mekan", tables: 42, color: "#60A5FA" },
    { label: "Bar", tables: 12, color: "#A78BFA" },
    { label: "Bahçe", tables: 18, color: "#34D399" },
  ];

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">
            {t.dashboard.title}
          </h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.dashboard.subtitle}</p>
        </div>

        <DateFilterBar
          activePeriod={activePeriod}
          activeDate={isValidDate ? date : undefined}
        />
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]"
          >
            <div className={`p-3 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1F2430]">{kpi.value}</p>
              <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
                {kpi.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler Sıra 1 */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <HourlyScansChart data={hourlyData} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CityScansChart data={cityData} />
        </div>
      </div>

      {/* Grafikler Sıra 2 */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-4">
          <ZoneChart data={zoneData} />
        </div>

        <div className="col-span-12 lg:col-span-8 bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
          <div className="px-8 py-6 flex justify-between items-center border-b border-[#E9E9F2]">
            <h3 className="text-lg font-bold text-[#1F2430]">{t.dashboard.topTables.title}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span className="w-3 h-3 rounded-full bg-[#7C6CF6]"></span>
                {t.dashboard.topTables.highVol}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span className="w-3 h-3 rounded-full bg-[#E9E9F2]"></span>
                {t.dashboard.topTables.normal}
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
                {topTables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-[#9AA3B2] text-sm">
                      {periodDisplayLabel} için henüz tarama verisi yok.
                    </td>
                  </tr>
                ) : (
                  topTables.map((table) => {
                    const maxScans = topTables[0]?.scans ?? 1;
                    const pct = Math.round((table.scans / maxScans) * 100);
                    return (
                      <tr
                        key={table.tableId}
                        className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]"
                      >
                        <td className="px-8 py-5">
                          <span className="font-bold text-[#1F2430]">{table.tableId}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-[#6B7280]">{table.zone}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F2430]">{table.scans}</span>
                            <div className="w-16 h-1 bg-[#E9E9F2] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#7C6CF6]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[#6B7280]">
                          {table.avgDuration} {t.common.minutes}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bölge Envanteri */}
      <div className="bg-[#F6F6FB] rounded-xl p-8">
        <h3 className="text-lg font-bold text-[#1F2430] mb-6">{t.dashboard.inventory.title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <div key={zone.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-sm font-semibold text-[#1F2430]">{zone.label}</span>
              </div>
              <span className="text-sm font-bold text-[#1F2430]">
                {zone.tables} {t.common.tables}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
