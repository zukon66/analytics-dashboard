import DateFilterBar from "@/components/DateFilterBar";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import { getCurrentBusiness } from "@/lib/business-session";
import {
  getConversionRate,
  getPeriodKPIs,
  getScansByCity,
  getScansByHour,
  getScansByZone,
  getTopMenuItems,
  getTopTables,
} from "@/lib/queries";

const VALID_PERIODS = ["today", "7d", "30d"];

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

  const [kpisRes, hourlyRes, cityRes, zoneRes, conversionRes, topItemsRes, topTablesRes] = await Promise.all([
    getPeriodKPIs(queryKey, businessId),
    getScansByHour(queryKey, businessId),
    getScansByCity(queryKey, businessId),
    getScansByZone(queryKey, businessId),
    getConversionRate(businessId),
    getTopMenuItems(8, businessId, isValidDate ? date : activePeriod === "today" ? "today" : activePeriod),
    getTopTables(5, queryKey, businessId),
  ]);

  const topItems = topItemsRes.data;
  const maxCount = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-6">
        <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          QR Analitiği
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">Menü Analitiği</h1>
        <p className="text-[var(--text-2)] text-sm font-medium">{business.name} için tarama ve sipariş performansı</p>
      </div>

      <div className="mb-8">
        <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
      </div>

      {/* 6 KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { icon: "qr_code_scanner", label: "Toplam Tarama", value: kpisRes.data.totalScans.toLocaleString("tr-TR") },
          { icon: "schedule", label: "Zirve Saat", value: kpisRes.data.peakHour },
          { icon: "location_city", label: "Aktif Şehir", value: String(kpisRes.data.activeCities) },
          { icon: "table_restaurant", label: "Aktif Bölge", value: String(kpisRes.data.activeZones) },
          { icon: "swap_horiz", label: "Dönüşüm", value: `%${conversionRes.data.rate}` },
          {
            icon: "leaderboard",
            label: "En İyi Masa",
            value: topTablesRes.data[0]?.tableId ?? "--",
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="kok-card rounded-3xl p-5 flex flex-col gap-3">
            <div className="kok-icon-tile p-2.5 rounded-xl text-[var(--accent)] w-fit">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[var(--text-1)]">{value}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <HourlyScansChart data={hourlyRes.data} period={queryKey} />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-7">
          <CityScansChart data={cityRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ZoneChart data={zoneRes.data} />
        </div>
      </div>

      {/* Top Menu Items + Top Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* En Çok Sipariş Edilen */}
        <section className="kok-card rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-1)]">En Çok Sipariş Edilen Ürünler</h2>
            <p className="text-sm text-[var(--text-2)] mt-1">Seçili dönemde adet bazında</p>
          </div>
          {topItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Bu dönem sipariş verisi yok</div>
          ) : (
            <div className="space-y-4">
              {topItems.map((item, idx) => (
                <div key={item.name} className="grid grid-cols-[20px_1fr_64px] items-center gap-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] text-right">{idx + 1}</span>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-[var(--text-1)] truncate">{item.name}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
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
                        className="h-full rounded-full"
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
          )}
        </section>

        {/* En İyi Masalar */}
        <section className="kok-card rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text-1)]">En Aktif Masalar</h2>
            <p className="text-sm text-[var(--text-2)] mt-1">Seçili dönemde QR taramaya göre</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-6 py-4">Masa</th>
                  <th className="px-6 py-4">Bölge</th>
                  <th className="px-6 py-4">Tarama</th>
                  <th className="px-6 py-4">Ort. Süre</th>
                </tr>
              </thead>
              <tbody>
                {topTablesRes.data.map((table) => (
                  <tr key={table.tableId} className="border-t border-[var(--border)] hover:bg-white/[0.025]">
                    <td className="px-6 py-4 font-bold text-[var(--text-1)]">{table.tableId}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-2)]">{table.zone}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--accent)]">{table.scans}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-2)]">{table.avgDuration} dk</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {topTablesRes.data.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">Bu dönem tarama verisi yok</div>
          )}
        </section>
      </div>
    </main>
  );
}
