import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business-session";
import { getTablePerformance } from "@/lib/queries";

export default async function PortalTablePerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const business = await getCurrentBusiness();
  const { q = "" } = await searchParams;
  const tablesRes = await getTablePerformance(q, Number(business.id));
  const rows = tablesRes.data;
  const totalRevenue = rows.reduce((sum, table) => sum + table.revenue, 0);
  const totalOrders = rows.reduce((sum, table) => sum + table.orders, 0);
  const totalScans = rows.reduce((sum, table) => sum + table.scans, 0);
  const bestTable = rows[0];
  const weakTables = rows.filter((table) => table.scans > 0 && table.conversionRate < 35).length;

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">Masa Performansı</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.name} masa, bölge ve sipariş verimliliği
          </p>
        </div>
        <form method="get" className="flex items-center gap-2 max-w-sm w-full">
          <input
            name="q"
            defaultValue={q}
            placeholder="Masa veya bölge ara..."
            className="w-full bg-black/20 border border-[var(--border)] rounded-full py-2.5 px-4 text-sm text-[var(--text-1)]"
          />
          <button className="kok-gradient-button text-white px-4 py-2.5 rounded-full text-xs font-bold">Ara</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">₺{totalRevenue.toLocaleString("tr-TR")}</p>
          <p className="text-xs text-[var(--text-muted)]">Masa bazlı toplam ciro</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{totalOrders}</p>
          <p className="text-xs text-[var(--text-muted)]">Toplam sipariş</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">%{Math.round((totalOrders / Math.max(totalScans, 1)) * 100)}</p>
          <p className="text-xs text-[var(--text-muted)]">Genel dönüşüm</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{weakTables}</p>
          <p className="text-xs text-[var(--text-muted)]">Düşük performanslı masa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        <section className="kok-card rounded-3xl p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-1)]">Masa Sıralaması</h2>
              <p className="text-sm text-[var(--text-2)]">Ciro, sipariş ve QR tarama ilişkisi</p>
            </div>
            <span className="kok-soft-button rounded-full px-3 py-1 text-[10px] font-bold text-[var(--accent)]">
              {rows.length} masa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-4 py-3">Masa</th>
                  <th className="px-4 py-3">Bölge</th>
                  <th className="px-4 py-3">QR</th>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Ciro</th>
                  <th className="px-4 py-3">Ort. hesap</th>
                  <th className="px-4 py-3">Dönüşüm</th>
                  <th className="px-4 py-3">Son aktivite</th>
                  <th className="px-4 py-3 text-right">Analiz</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((table) => (
                  <tr key={table.tableId} className="border-t border-[var(--border)] hover:bg-white/[0.035]">
                    <td className="px-4 py-4 font-bold text-[var(--text-1)]">{table.tableId}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-2)]">{table.zone}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[var(--accent)]">{table.scans}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-2)]">{table.orders}</td>
                    <td className="px-4 py-4 font-bold text-[var(--text-1)]">₺{table.revenue.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-2)]">₺{table.avgAmount.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[var(--accent)]">%{table.conversionRate}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-2)]">
                      {new Date(table.lastActivity).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/portal/customers/${encodeURIComponent(table.tableId)}`}
                        className="kok-soft-button inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-[var(--accent)]"
                      >
                        Detay
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="kok-empty py-20 text-center">
              <p className="text-lg font-bold text-[var(--text-1)]">Masa verisi bulunamadı</p>
              <Link href="/portal/orders" className="text-sm text-[var(--accent)] font-semibold mt-2 inline-block">
                Siparişleri kontrol et
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="kok-card rounded-3xl p-6">
            <span className="material-symbols-outlined text-[var(--accent)] mb-4">leaderboard</span>
            <h2 className="text-lg font-bold text-[var(--text-1)]">En Güçlü Masa</h2>
            <p className="text-sm text-[var(--text-2)] mt-1">
              {bestTable
                ? `${bestTable.tableId} - ${bestTable.zone}, ₺${bestTable.revenue.toLocaleString("tr-TR")} ciro`
                : "Henüz masa aktivitesi yok"}
            </p>
          </section>

          <section className="kok-card rounded-3xl p-6">
            <span className="material-symbols-outlined text-[var(--accent)] mb-4">schedule</span>
            <h2 className="text-lg font-bold text-[var(--text-1)]">Yoğun Saatler</h2>
            <div className="mt-4 space-y-3">
              {rows.slice(0, 5).map((table) => (
                <div key={table.tableId} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-1)]">{table.tableId}</p>
                    <p className="text-xs text-[var(--text-muted)]">{table.zone}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--accent)]">{table.peakHour}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
