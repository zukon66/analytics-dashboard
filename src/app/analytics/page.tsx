import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getWeeklyStats,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import t from "@/lib/i18n";

export const revalidate = 60;

export default async function AnalyticsPage() {
  const [hourlyData, cityData, zoneData, weekly] = await Promise.all([
    getScansByHour(),
    getScansByCity(),
    getScansByZone(),
    getWeeklyStats(),
  ]);

  const peakHour = hourlyData.reduce(
    (max, d) => (d.scans > max.scans ? d : max),
    hourlyData[0] ?? { hour: "--", scans: 0 }
  );

  const summaryCards = [
    {
      label: t.analytics.weeklyScans,
      value: weekly.total.toLocaleString("tr-TR"),
      icon: "qr_code_scanner",
      color: "bg-[#aef764]/40 text-[#335c00]",
    },
    {
      label: t.analytics.avgPerDay,
      value: weekly.avgPerDay.toLocaleString("tr-TR"),
      icon: "show_chart",
      color: "bg-[#a1d1fe]/40 text-[#0a476d]",
    },
    {
      label: t.analytics.bestDay,
      value: weekly.bestDay,
      icon: "emoji_events",
      color: "bg-[#ebdcff]/60 text-[#594a74]",
    },
    {
      label: t.analytics.peakHour,
      value: peakHour.hour,
      icon: "schedule",
      color: "bg-[#e5e9eb] text-[#5a6062]",
    },
  ];

  const hasData = weekly.total > 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#f8f9fa]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="px-3 py-1 bg-[#ebdcff] text-[#594a74] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            {t.analytics.badge.trend}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2e3335] mb-1">
            {t.analytics.title}
          </h1>
          <p className="text-[#5a6062] text-sm font-medium">
            {t.analytics.subtitle}
          </p>
        </div>
        <button className="bg-[#3c6b00] text-[#eeffd6] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          {t.dashboard.filters.export}
        </button>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${card.color}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#2e3335]">
                {card.value}
              </p>
              <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Boş durum */}
      {!hasData && (
        <div className="bg-[#ffffff] rounded-xl p-16 flex flex-col items-center justify-center text-center mb-8">
          <div className="p-4 bg-[#f2f4f5] rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-[#5a6062]">
              analytics
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#2e3335] mb-2">
            {t.common.noData}
          </h3>
          <p className="text-sm text-[#5a6062] max-w-sm">
            Supabase&apos;de <code className="bg-[#f2f4f5] px-1 rounded text-xs">scans</code> tablosunu
            oluşturup veri ekledikten sonra grafikler burada görünecek.
          </p>
        </div>
      )}

      {/* Saatlik Grafik */}
      <div className="mb-8">
        <HourlyScansChart data={hourlyData} />
      </div>

      {/* Şehir + Bölge */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <CityScansChart data={cityData} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ZoneChart data={zoneData} />
        </div>
      </div>
    </main>
  );
}
