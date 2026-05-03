import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business-session";
import { getTableDetail } from "@/lib/queries";

const statusLabel: Record<string, string> = {
  completed: "Tamamlandı",
  pending: "Bekliyor",
  cancelled: "İptal",
};

const statusClass: Record<string, string> = {
  completed: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
  pending: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  cancelled: "text-rose-300 bg-rose-500/10 border-rose-400/20",
};

export default async function PortalTableDetailPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const business = await getCurrentBusiness();
  const { tableId } = await params;
  const detailRes = await getTableDetail(tableId, Number(business.id));
  const detail = detailRes.data;
  const table = detail.summary;
  const maxActivity = Math.max(...detail.hourly.map((row) => row.scans + row.orders), 1);

  if (!table.tableId) notFound();

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/portal/customers"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Masa Performansına dön
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">
            {table.tableId} Detay Analizi
          </h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.name} içinde {table.zone} bölgesindeki masa performansı
          </p>
        </div>
        <div className="kok-soft-button rounded-full px-4 py-2 text-xs font-bold text-[var(--accent)]">
          Son aktivite: {new Date(table.lastActivity).toLocaleString("tr-TR")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">₺{table.revenue.toLocaleString("tr-TR")}</p>
          <p className="text-xs text-[var(--text-muted)]">Toplam ciro</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{table.orders}</p>
          <p className="text-xs text-[var(--text-muted)]">Sipariş</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{table.scans}</p>
          <p className="text-xs text-[var(--text-muted)]">QR tarama</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">%{table.conversionRate}</p>
          <p className="text-xs text-[var(--text-muted)]">Dönüşüm</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{table.avgDuration} dk</p>
          <p className="text-xs text-[var(--text-muted)]">Ort. oturum</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        <section className="kok-card rounded-3xl p-6 xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Saatlik Aktivite</h2>
            <p className="text-sm text-[var(--text-2)]">QR tarama ve siparişlerin en yoğun olduğu saatler</p>
          </div>
          <div className="space-y-4">
            {detail.hourly.map((row) => {
              const activity = row.scans + row.orders;
              return (
                <div key={row.hour} className="grid grid-cols-[64px_1fr_88px] items-center gap-4">
                  <span className="text-sm font-bold text-[var(--text-1)]">{row.hour}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6D5DF7] to-[#C084FC]"
                      style={{ width: `${Math.max(8, Math.round((activity / maxActivity) * 100))}%` }}
                    />
                  </div>
                  <span className="text-right text-xs font-bold text-[var(--text-2)]">
                    {row.scans} QR / {row.orders} sipariş
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="kok-card rounded-3xl p-6">
            <span className="material-symbols-outlined text-[var(--accent)] mb-4">payments</span>
            <h2 className="text-lg font-bold text-[var(--text-1)]">Hesap Özeti</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-2)]">Ortalama hesap</span>
                <strong className="text-[var(--text-1)]">₺{table.avgAmount.toLocaleString("tr-TR")}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-2)]">En yoğun saat</span>
                <strong className="text-[var(--text-1)]">{table.peakHour}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-2)]">Bölge</span>
                <strong className="text-[var(--text-1)]">{table.zone}</strong>
              </div>
            </div>
          </section>

          <section className="kok-card rounded-3xl p-6">
            <span className="material-symbols-outlined text-[var(--accent)] mb-4">fact_check</span>
            <h2 className="text-lg font-bold text-[var(--text-1)]">Sipariş Durumu</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(detail.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3">
                  <span className="text-sm text-[var(--text-2)]">{statusLabel[status]}</span>
                  <strong className="text-sm text-[var(--text-1)]">{count}</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="kok-card rounded-3xl overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Son Siparişler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-6 py-3">Sipariş</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3">Ne yendi / içildi</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Zaman</th>
                </tr>
              </thead>
              <tbody>
                {detail.recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[var(--border)]">
                    <td className="px-6 py-4 font-bold text-[var(--text-1)]">#{order.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--accent)]">₺{Number(order.total_amount).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4 min-w-[240px]">
                      <div className="space-y-1">
                        {(order.items ?? []).map((item, itemIndex) => (
                          <div key={`${order.id}-${itemIndex}-${item.name}`} className="flex items-center justify-between gap-3 text-xs">
                            <span className="text-[var(--text-1)]">
                              {item.quantity}x {item.name}
                              <span className="ml-1 text-[var(--text-muted)]">({item.category})</span>
                            </span>
                            <span className="font-bold text-[var(--text-2)]">₺{item.total.toLocaleString("tr-TR")}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-2)]">{new Date(order.created_at).toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {detail.recentOrders.length === 0 && (
            <div className="kok-empty py-14 text-center text-sm text-[var(--text-2)]">Bu masada henüz sipariş yok.</div>
          )}
        </section>

        <section className="kok-card rounded-3xl overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Son QR Oturumları</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {detail.recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-[var(--text-1)]">{new Date(scan.scanned_at).toLocaleString("tr-TR")}</p>
                  <p className="text-xs text-[var(--text-muted)]">{scan.zone}</p>
                </div>
                <span className="kok-soft-button rounded-full px-3 py-1 text-xs font-bold text-[var(--accent)]">
                  {scan.duration_minutes} dk
                </span>
              </div>
            ))}
          </div>
          {detail.recentScans.length === 0 && (
            <div className="kok-empty py-14 text-center text-sm text-[var(--text-2)]">Bu masada QR oturumu yok.</div>
          )}
        </section>
      </div>
    </main>
  );
}
