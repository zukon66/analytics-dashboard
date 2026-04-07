import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getTopTables,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import t from "@/lib/i18n";

export const revalidate = 60;

export default async function DashboardPage() {
  const [hourlyData, cityData, zoneData, topTables] = await Promise.all([
    getScansByHour(),
    getScansByCity(),
    getScansByZone(),
    getTopTables(),
  ]);

  const totalScansToday = hourlyData.reduce((s, d) => s + d.scans, 0);
  const peakHour = hourlyData.reduce(
    (max, d) => (d.scans > max.scans ? d : max),
    hourlyData[0] ?? { hour: "--", scans: 0 }
  );

  const kpis = [
    {
      label: t.dashboard.kpis.totalScans,
      value: totalScansToday.toLocaleString("tr-TR"),
      icon: "qr_code_scanner",
      color: "bg-[#aef764]/40 text-[#335c00]",
    },
    {
      label: t.dashboard.kpis.peakHour,
      value: peakHour.hour,
      icon: "schedule",
      color: "bg-[#a1d1fe]/40 text-[#0a476d]",
    },
    {
      label: t.dashboard.kpis.activeCities,
      value: cityData.length.toString(),
      icon: "location_city",
      color: "bg-[#ebdcff]/60 text-[#594a74]",
    },
    {
      label: t.dashboard.kpis.activeZones,
      value: zoneData.length.toString(),
      icon: "map",
      color: "bg-[#e5e9eb] text-[#5a6062]",
    },
  ];

  const zones = [
    { label: "Teras", tables: 24, color: "#3c6b00" },
    { label: "İç Mekan", tables: 42, color: "#31638a" },
    { label: "Bar", tables: 12, color: "#675882" },
    { label: "Bahçe", tables: 18, color: "#a0e857" },
  ];

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#f8f9fa]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2e3335] mb-1">
            {t.dashboard.title}
          </h1>
          <p className="text-[#5a6062] text-sm font-medium">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#e5e9eb] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 text-[#2e3335]">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {t.dashboard.filters.last24h}
          </button>
          <button className="bg-[#3c6b00] text-[#eeffd6] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            {t.dashboard.filters.export}
          </button>
        </div>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${kpi.color}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#2e3335]">{kpi.value}</p>
              <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
                {kpi.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler Sıra 1: Saatlik + Şehir */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <HourlyScansChart data={hourlyData} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CityScansChart data={cityData} />
        </div>
      </div>

      {/* Grafikler Sıra 2: Bölge Pasta + En İyi Masalar */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-4">
          <ZoneChart data={zoneData} />
        </div>

        <div className="col-span-12 lg:col-span-8 bg-[#ffffff] rounded-xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-[#ebeef0]">
            <h3 className="text-lg font-bold text-[#2e3335]">
              {t.dashboard.topTables.title}
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6062]">
                <span className="w-3 h-3 rounded-full bg-[#3c6b00]"></span>
                {t.dashboard.topTables.highVol}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6062]">
                <span className="w-3 h-3 rounded-full bg-[#e5e9eb]"></span>
                {t.dashboard.topTables.normal}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062]">
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.tableId}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.zone}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.dailyScans}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.avgDuration}</th>
                </tr>
              </thead>
              <tbody>
                {topTables.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-[#5a6062] text-sm"
                    >
                      {t.dashboard.topTables.empty}
                    </td>
                  </tr>
                ) : (
                  topTables.map((table) => {
                    const maxScans = topTables[0]?.scans ?? 1;
                    const pct = Math.round((table.scans / maxScans) * 100);
                    return (
                      <tr
                        key={table.tableId}
                        className="hover:bg-[#f2f4f5] transition-colors border-t border-[#ebeef0]"
                      >
                        <td className="px-8 py-5">
                          <span className="font-bold text-[#2e3335]">{table.tableId}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-[#5a6062]">{table.zone}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{table.scans}</span>
                            <div className="w-16 h-1 bg-[#ebeef0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#3c6b00]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[#5a6062]">
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
      <div className="bg-[#f2f4f5] rounded-xl p-8">
        <h3 className="text-lg font-bold text-[#2e3335] mb-6">
          {t.dashboard.inventory.title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {zones.map((zone) => (
            <div key={zone.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="text-sm font-semibold text-[#2e3335]">
                  {zone.label}
                </span>
              </div>
              <span className="text-sm font-bold text-[#2e3335]">
                {zone.tables} {t.common.tables}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
