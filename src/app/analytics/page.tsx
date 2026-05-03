import {
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getWeeklyStats,
  getDailyScanCounts,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import AnalyticsExportButton from "@/components/AnalyticsExportButton";
import DateFilterBar from "@/components/DateFilterBar";
import AnomalyAlert from "@/components/AnomalyAlert";
import t from "@/lib/i18n";

export const revalidate = 60;

const VALID_PERIODS = ["today", "7d", "30d"];

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 bg-amber-500/10 border border-amber-300/20 rounded-2xl px-5 py-3 text-sm text-amber-200">
      <span className="material-symbols-outlined text-base">warning</span>
      <span>Veri yüklenirken sorun oluştu. Lütfen sayfayı yenileyin.</span>
      <span className="ml-auto text-[10px] font-mono opacity-50">{message.slice(0, 60)}</span>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period = "7d", date } = await searchParams;
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "7d";
  const queryKey = isValidDate ? date : activePeriod;

  const [hourlyRes, cityRes, zoneRes, weeklyRes, dailyRes] = await Promise.all([
    getScansByHour(queryKey),
    getScansByCity(queryKey),
    getScansByZone(queryKey),
    getWeeklyStats(),
    getDailyScanCounts(14),
  ]);

  const weekly = weeklyRes.data;
  const hasError = [hourlyRes, cityRes, zoneRes, weeklyRes].some((r) => r.error);

  const peakHour = hourlyRes.data.reduce(
    (max, d) => (d.scans > max.scans ? d : max),
    hourlyRes.data[0] ?? { hour: "--", scans: 0 }
  );

  const summaryCards = [
    { label: t.analytics.weeklyScans, value: weekly.total.toLocaleString("tr-TR"), icon: "qr_code_scanner", iconBg: "bg-[#EEEAFE]", iconColor: "text-[#7C6CF6]" },
    { label: t.analytics.avgPerDay, value: weekly.avgPerDay.toLocaleString("tr-TR"), icon: "show_chart", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]" },
    { label: t.analytics.bestDay, value: weekly.bestDay, icon: "emoji_events", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]" },
    { label: t.analytics.peakHour, value: peakHour.hour, icon: "schedule", iconBg: "bg-[#F3F4F6]", iconColor: "text-[#6B7280]" },
  ];

  const hasData = weekly.total > 0;

  return (
    <main className="kok-page kok-fade-in pt-20 md:pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            {t.analytics.badge.trend}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">{t.analytics.title}</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">{t.analytics.subtitle}</p>
        </div>
        <AnalyticsExportButton
          hourlyData={hourlyRes.data}
          cityData={cityRes.data}
          zoneData={zoneRes.data}
          weekly={{ total: weekly.total, avgPerDay: weekly.avgPerDay, bestDay: weekly.bestDay }}
          peakHour={peakHour.hour}
        />
      </div>

      <div className="mb-8">
        <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
      </div>

      {hasError && <ErrorBanner message={[hourlyRes, cityRes, zoneRes, weeklyRes].find((r) => r.error)?.error ?? ""} />}

      {/* Anomali Uyarıları */}
      <AnomalyAlert daily={dailyRes.data} />

      {/* KPI Şeridi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
            <div className={`kok-icon-tile p-3 rounded-2xl ${card.iconBg} ${card.iconColor}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--text-1)]">{card.value}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div className="kok-card kok-empty rounded-3xl p-16 flex flex-col items-center justify-center text-center mb-8">
          <div className="kok-icon-tile p-4 rounded-full mb-4 kok-pulse-soft">
            <span className="material-symbols-outlined text-4xl text-[var(--accent)]">analytics</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-1)] mb-2">Bu dönem için henüz tarama yok</h3>
          <p className="text-sm text-[#6B7280] max-w-sm">Müşterileriniz QR menünüzü taramaya başladığında trendler burada görünecek.</p>
        </div>
      )}

      <div className="mb-8"><HourlyScansChart data={hourlyRes.data} period={queryKey} /></div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7"><CityScansChart data={cityRes.data} /></div>
        <div className="col-span-12 lg:col-span-5"><ZoneChart data={zoneRes.data} /></div>
      </div>
    </main>
  );
}
