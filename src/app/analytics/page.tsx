import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getWeeklyStats,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import AnalyticsExportButton from "@/components/AnalyticsExportButton";
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
    { label: t.analytics.weeklyScans, value: weekly.total.toLocaleString("tr-TR"), icon: "qr_code_scanner", iconBg: "bg-[#EEEAFE]", iconColor: "text-[#7C6CF6]" },
    { label: t.analytics.avgPerDay, value: weekly.avgPerDay.toLocaleString("tr-TR"), icon: "show_chart", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]" },
    { label: t.analytics.bestDay, value: weekly.bestDay, icon: "emoji_events", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]" },
    { label: t.analytics.peakHour, value: peakHour.hour, icon: "schedule", iconBg: "bg-[#F3F4F6]", iconColor: "text-[#6B7280]" },
  ];

  const hasData = weekly.total > 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            {t.analytics.badge.trend}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">
            {t.analytics.title}
          </h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.analytics.subtitle}</p>
        </div>
        <AnalyticsExportButton
          hourlyData={hourlyData}
          cityData={cityData}
          zoneData={zoneData}
          weekly={{ total: weekly.total, avgPerDay: weekly.avgPerDay, bestDay: weekly.bestDay }}
          peakHour={peakHour.hour}
        />
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
            <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#1F2430]">{card.value}</p>
              <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Boş durum */}
      {!hasData && (
        <div className="bg-[#FFFFFF] rounded-xl p-16 flex flex-col items-center justify-center text-center mb-8 border border-[#E9E9F2]">
          <div className="p-4 bg-[#F6F6FB] rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-[#9AA3B2]">analytics</span>
          </div>
          <h3 className="text-lg font-bold text-[#1F2430] mb-2">Bu hafta henüz tarama yok</h3>
          <p className="text-sm text-[#6B7280] max-w-sm">
            Müşterileriniz QR menünüzü taramaya başladığında trendler burada görünecek.
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
