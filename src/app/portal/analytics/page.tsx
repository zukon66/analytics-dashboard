import DateFilterBar from "@/components/DateFilterBar";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import { getCurrentBusiness } from "@/lib/business-session";
import { getPeriodKPIs, getScansByCity, getScansByHour, getScansByZone } from "@/lib/queries";

const VALID_PERIODS = ["today", "7d", "30d"];

export default async function PortalAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const business = await getCurrentBusiness();
  const { period = "7d", date } = await searchParams;
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "7d";
  const queryKey = isValidDate ? date : activePeriod;
  const businessId = Number(business.id);

  const [kpisRes, hourlyRes, cityRes, zoneRes] = await Promise.all([
    getPeriodKPIs(queryKey, businessId),
    getScansByHour(queryKey, businessId),
    getScansByCity(queryKey, businessId),
    getScansByZone(queryKey, businessId),
  ]);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-6">
        <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Kendi Verin
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">Menü Analitiği</h1>
        <p className="text-[var(--text-2)] text-sm font-medium">{business.name} için tarama performansı</p>
      </div>

      <div className="mb-8">
        <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          ["qr_code_scanner", "Toplam Tarama", kpisRes.data.totalScans],
          ["schedule", "Zirve Saat", kpisRes.data.peakHour],
          ["location_city", "Aktif Şehir", kpisRes.data.activeCities],
          ["table_restaurant", "Aktif Bölge", kpisRes.data.activeZones],
        ].map(([icon, label, value]) => (
          <div key={label} className="kok-card rounded-3xl p-6 flex items-center gap-4">
            <div className="kok-icon-tile p-3 rounded-2xl text-[var(--accent)]">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--text-1)]">{String(value)}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8"><HourlyScansChart data={hourlyRes.data} period={queryKey} /></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7"><CityScansChart data={cityRes.data} /></div>
        <div className="col-span-12 lg:col-span-5"><ZoneChart data={zoneRes.data} /></div>
      </div>
    </main>
  );
}
