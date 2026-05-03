import Link from "next/link";
import { getCurrentBusiness, trialDaysLeft } from "@/lib/business-session";
import {
  getCustomerStats,
  getOrderStats,
  getPeriodKPIs,
  getScansByCity,
  getScansByHour,
  getScansByZone,
  getTopTables,
  getWeeklyStats,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";

export const revalidate = 60;

function MetricCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
      <div className="kok-icon-tile p-3 rounded-2xl text-[var(--accent)]">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[var(--text-1)]">{value}</p>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function BusinessPortalPage() {
  const business = await getCurrentBusiness();
  const businessId = Number(business.id);

  const [periodRes, weeklyRes, hourlyRes, cityRes, zoneRes, tablesRes, orderRes, customerRes] = await Promise.all([
    getPeriodKPIs("today", businessId),
    getWeeklyStats(businessId),
    getScansByHour("7d", businessId),
    getScansByCity("7d", businessId),
    getScansByZone("today", businessId),
    getTopTables(8, "7d", businessId),
    getOrderStats(businessId),
    getCustomerStats(businessId),
  ]);

  const trialLeft = trialDaysLeft(business);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            İşletme Paneli
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">
            {business.name}
          </h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.city} · {business.plan.toUpperCase()} planı
            {trialLeft !== null ? ` · Trial kalan ${trialLeft} gün` : ""}
          </p>
        </div>
        <Link href="/portal/settings" className="kok-gradient-button text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 w-fit">
          <span className="material-symbols-outlined text-sm">settings</span>
          Ayarları Aç
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard icon="qr_code_scanner" label="Bugünkü Tarama" value={periodRes.data.totalScans.toLocaleString("tr-TR")} sub={`Zirve: ${periodRes.data.peakHour}`} />
        <MetricCard icon="calendar_month" label="Haftalık Tarama" value={weeklyRes.data.total.toLocaleString("tr-TR")} sub={`${weeklyRes.data.avgPerDay} / gün ortalama`} />
        <MetricCard icon="payments" label="Toplam Ciro" value={`₺${orderRes.data.totalRevenue.toLocaleString("tr-TR")}`} sub={`${orderRes.data.completed} tamamlanan sipariş`} />
        <MetricCard icon="group" label="Müşteriler" value={customerRes.data.total.toLocaleString("tr-TR")} sub={`${customerRes.data.returning} tekrar gelen`} />
      </div>

      <div className="mb-8">
        <HourlyScansChart data={hourlyRes.data} period="7d" />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-7">
          <CityScansChart data={cityRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ZoneChart data={zoneRes.data} title="Bölgeye Göre Tarama" subtitle="Bugünkü masa bölgeleri" totalLabel="İşletme Taraması" />
        </div>
      </div>

      <section className="kok-card rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-1)]">Detaylı Masa Performansı</h2>
          <p className="text-sm text-[var(--text-2)] mt-1">Son 7 günde en çok taranan masalar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <th className="px-8 py-4">Masa</th>
                <th className="px-8 py-4">Bölge</th>
                <th className="px-8 py-4">Tarama</th>
                <th className="px-8 py-4">Ort. Süre</th>
              </tr>
            </thead>
            <tbody>
              {tablesRes.data.map((table) => (
                <tr key={table.tableId} className="border-t border-[var(--border)] hover:bg-white/[0.035]">
                  <td className="px-8 py-4 font-bold text-[var(--text-1)]">{table.tableId}</td>
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{table.zone}</td>
                  <td className="px-8 py-4 text-sm font-bold text-[var(--accent)]">{table.scans}</td>
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{table.avgDuration} dk</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
