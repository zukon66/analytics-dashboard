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

  const totalRevenue = rows.reduce((sum, t) => sum + t.revenue, 0);
  const totalOrders = rows.reduce((sum, t) => sum + t.orders, 0);
  const totalScans = rows.reduce((sum, t) => sum + t.scans, 0);
  const totalPendingOrders = rows.reduce((sum, t) => sum + (t.pendingOrders ?? 0), 0);
  const pendingTables = rows.filter((t) => (t.pendingOrders ?? 0) > 0);
  const weakTables = rows.filter((t) => t.scans > 0 && t.conversionRate < 35).length;
  const bestTable = rows[0];

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Masa Yönetimi
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">
            Masa Performansı
          </h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.name} · QR tarama, sipariş ve ciro verimliliği
          </p>
        </div>
        <form method="get" className="flex items-center gap-2 max-w-sm w-full">
          <input
            name="q"
            defaultValue={q}
            placeholder="Masa no veya bölge ara..."
            className="w-full bg-black/20 border border-[var(--border)] rounded-full py-2.5 px-4 text-sm text-[var(--text-1)]"
          />
          <button className="kok-gradient-button text-white px-4 py-2.5 rounded-full text-xs font-bold">
            Ara
          </button>
        </form>
      </div>

      {/* Açık sipariş banner */}
      {totalPendingOrders > 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-400/20 text-amber-200 rounded-2xl px-5 py-4">
          <span className="material-symbols-outlined text-xl text-amber-300 flex-shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="font-bold text-amber-300 text-sm">
              {totalPendingOrders} açık sipariş · {pendingTables.length} masada
            </p>
            <p className="text-xs text-amber-200/75 mt-0.5">
              Teslim edilmemiş veya ödenmemiş siparişler var. Detay için satıra tıklayın.
            </p>
          </div>
        </div>
      )}

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">
            ₺{totalRevenue.toLocaleString("tr-TR")}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Toplam ciro</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{totalOrders}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Toplam sipariş</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">
            %{Math.round((totalOrders / Math.max(totalScans, 1)) * 100)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Genel dönüşüm</p>
        </div>
        <div
          className={`kok-card rounded-3xl p-6 ${
            totalPendingOrders > 0 ? "border border-amber-400/20" : ""
          }`}
        >
          <p
            className={`text-2xl font-black ${
              totalPendingOrders > 0 ? "text-amber-300" : "text-[var(--text-1)]"
            }`}
          >
            {totalPendingOrders}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Açık sipariş</p>
        </div>
      </div>

      {/* İçerik */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        {/* Masa tablosu */}
        <section className="kok-card rounded-3xl xl:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[var(--border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-1)]">Masa Sıralaması</h2>
              <p className="text-sm text-[var(--text-2)] mt-0.5">
                Ciro, sipariş ve QR tarama ilişkisi
              </p>
            </div>
            <span className="kok-soft-button rounded-full px-3 py-1 text-[10px] font-bold text-[var(--accent)]">
              {rows.length} masa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-5 py-3.5">Masa</th>
                  <th className="px-5 py-3.5">Bölge</th>
                  <th className="px-5 py-3.5">QR</th>
                  <th className="px-5 py-3.5">Sipariş</th>
                  <th className="px-5 py-3.5">Ciro</th>
                  <th className="px-5 py-3.5">Ort. hesap</th>
                  <th className="px-5 py-3.5">Dönüşüm</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Son aktivite</th>
                  <th className="px-5 py-3.5 text-right">Analiz</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((table) => {
                  const pending = table.pendingOrders ?? 0;
                  return (
                    <tr
                      key={table.tableId}
                      className={`border-t border-[var(--border)] hover:bg-white/[0.035] transition-colors ${
                        pending > 0 ? "bg-amber-500/[0.03]" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-bold text-[var(--text-1)]">
                        {table.tableId}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--text-2)]">{table.zone}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[var(--accent)]">
                        {table.scans}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--text-2)]">{table.orders}</td>
                      <td className="px-5 py-4 font-bold text-[var(--text-1)]">
                        ₺{table.revenue.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--text-2)]">
                        ₺{table.avgAmount.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[var(--accent)]">
                        %{table.conversionRate}
                      </td>
                      <td className="px-5 py-4">
                        {pending > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                            <span className="material-symbols-outlined text-xs leading-none">
                              hourglass_empty
                            </span>
                            {pending} açık
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--text-2)] whitespace-nowrap">
                        {new Date(table.lastActivity).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/portal/customers/${encodeURIComponent(table.tableId)}`}
                          className="kok-soft-button inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-[var(--accent)]"
                        >
                          Detay
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="kok-empty py-20 text-center">
              <p className="text-lg font-bold text-[var(--text-1)]">Masa verisi bulunamadı</p>
              <Link
                href="/portal/orders"
                className="text-sm text-[var(--accent)] font-semibold mt-2 inline-block"
              >
                Siparişleri kontrol et
              </Link>
            </div>
          )}
        </section>

        {/* Kenar panel */}
        <aside className="space-y-5">
          {/* En güçlü masa */}
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[var(--accent)]">leaderboard</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">En Güçlü Masa</h2>
            </div>
            {bestTable ? (
              <>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">
                  <strong className="text-[var(--text-1)]">{bestTable.tableId}</strong> —{" "}
                  {bestTable.zone}
                  <br />
                  ₺{bestTable.revenue.toLocaleString("tr-TR")} ciro ·{" "}
                  {bestTable.orders} sipariş
                </p>
                <Link
                  href={`/portal/customers/${encodeURIComponent(bestTable.tableId)}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]"
                >
                  Detaylı Analiz
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Henüz masa aktivitesi yok</p>
            )}
          </section>

          {/* Açık siparişler */}
          {pendingTables.length > 0 && (
            <section className="kok-card rounded-3xl p-6 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-300">hourglass_empty</span>
                <h2 className="text-base font-bold text-[var(--text-1)]">Açık Siparişler</h2>
              </div>
              <div className="space-y-2">
                {pendingTables.slice(0, 6).map((table) => (
                  <Link
                    key={table.tableId}
                    href={`/portal/customers/${encodeURIComponent(table.tableId)}`}
                    className="flex items-center justify-between rounded-2xl bg-amber-500/[0.06] border border-amber-400/10 px-4 py-3 hover:bg-amber-500/10 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-[var(--text-1)]">
                        {table.tableId}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{table.zone}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-300">
                      {table.pendingOrders} açık
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Zirve saatleri */}
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[var(--accent)]">schedule</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">Zirve Saatleri</h2>
            </div>
            <div className="space-y-2.5">
              {rows.slice(0, 5).map((table) => (
                <div
                  key={table.tableId}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-[var(--text-1)]">{table.tableId}</p>
                    <p className="text-xs text-[var(--text-muted)]">{table.zone}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--accent)]">
                    {table.peakHour}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Düşük performans */}
          {weakTables > 0 && (
            <section className="kok-card rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-rose-400">trending_down</span>
                <h2 className="text-base font-bold text-[var(--text-1)]">Düşük Performans</h2>
              </div>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                <strong className="text-[var(--text-1)]">{weakTables} masa</strong>da dönüşüm
                %35 altında. Menü yerleşimi veya servis hızı optimize edilebilir.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
