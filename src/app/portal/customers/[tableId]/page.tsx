import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business-session";
import { getTableDetail } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  completed: "Tamamlandı",
  pending: "Bekliyor",
  cancelled: "İptal",
};

const STATUS_CLASS: Record<string, string> = {
  completed: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
  pending: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  cancelled: "text-rose-300 bg-rose-500/10 border-rose-400/20",
};

const STATUS_EXPLANATION: Record<string, string> = {
  completed: "Sipariş teslim edildi, ödeme alındı.",
  pending: "Sipariş alındı; servis veya ödeme henüz tamamlanmadı.",
  cancelled: "Sipariş iptal edildi; bu tutar cirodan sayılmaz.",
};

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

  if (!table.tableId) notFound();

  const maxActivity = Math.max(...detail.hourly.map((r) => r.scans + r.orders), 1);
  const hasPending = detail.statusBreakdown.pending > 0;

  // En çok sipariş edilen ürünler — iptal edilmeyenlerden hesapla
  const itemMap: Record<string, { name: string; category: string; count: number; revenue: number }> = {};
  for (const order of detail.recentOrders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items ?? []) {
      itemMap[item.name] ??= { name: item.name, category: item.category, count: 0, revenue: 0 };
      itemMap[item.name].count += item.quantity;
      itemMap[item.name].revenue += item.total;
    }
  }
  const topItems = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxItemCount = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/portal/customers"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Masa Performansına dön
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">
            {table.tableId} — Detay Analizi
          </h1>
          <p className="text-[var(--text-2)] text-sm font-medium">
            {business.name} · {table.zone} bölgesi
          </p>
        </div>
        <div className="kok-soft-button rounded-full px-4 py-2 text-xs font-bold text-[var(--accent)]">
          Son aktivite: {new Date(table.lastActivity).toLocaleString("tr-TR")}
        </div>
      </div>

      {/* Açık sipariş uyarısı */}
      {hasPending && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-400/25 rounded-2xl px-5 py-4">
          <span className="material-symbols-outlined text-xl text-amber-300 flex-shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="font-bold text-amber-300 text-sm">
              {detail.statusBreakdown.pending} açık sipariş — servis ekibini bilgilendirin
            </p>
            <p className="text-xs text-amber-200/75 mt-0.5">
              Bu masada teslim edilmemiş veya ödenmemiş sipariş var. Aşağıdaki sipariş
              listesinde sarı durumu kontrol edin.
            </p>
          </div>
        </div>
      )}

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">
            ₺{table.revenue.toLocaleString("tr-TR")}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Toplam ciro</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{table.orders}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Toplam sipariş</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">{table.scans}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">QR tarama</p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-2xl font-black text-[var(--text-1)]">%{table.conversionRate}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Dönüşüm</p>
        </div>
        <div
          className={`kok-card rounded-3xl p-6 ${
            hasPending ? "border border-amber-400/20" : ""
          }`}
        >
          <p
            className={`text-2xl font-black ${
              hasPending ? "text-amber-300" : "text-[var(--text-1)]"
            }`}
          >
            {detail.statusBreakdown.pending}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Açık sipariş</p>
        </div>
      </div>

      {/* Saatlik aktivite + Özet bilgiler */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        {/* Saatlik aktivite grafiği */}
        <section className="kok-card rounded-3xl p-6 xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Saatlik Aktivite</h2>
            <p className="text-sm text-[var(--text-2)] mt-0.5">
              QR tarama ve siparişlerin en yoğun olduğu saatler
            </p>
          </div>
          <div className="space-y-3">
            {detail.hourly.map((row) => {
              const activity = row.scans + row.orders;
              return (
                <div key={row.hour} className="grid grid-cols-[64px_1fr_108px] items-center gap-4">
                  <span className="text-sm font-bold text-[var(--text-1)]">{row.hour}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6D5DF7] to-[#C084FC]"
                      style={{
                        width: `${Math.max(4, Math.round((activity / maxActivity) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-xs font-bold text-[var(--text-2)]">
                    {row.scans} QR · {row.orders} sipariş
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sağ panel */}
        <aside className="space-y-5">
          {/* Hesap özeti */}
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[var(--accent)]">payments</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">Hesap Özeti</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Ortalama hesap", `₺${table.avgAmount.toLocaleString("tr-TR")}`],
                ["Ort. oturum süresi", `${table.avgDuration} dk`],
                ["En yoğun saat", table.peakHour],
                ["Bölge", table.zone],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[var(--text-2)]">{label}</span>
                  <strong className="text-[var(--text-1)]">{value}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* Sipariş durumu dökümü */}
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[var(--accent)]">fact_check</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">Sipariş Durumu</h2>
            </div>
            <div className="space-y-3">
              {(["completed", "pending", "cancelled"] as const).map((status) => {
                const count = detail.statusBreakdown[status];
                return (
                  <div
                    key={status}
                    className={`rounded-2xl border px-4 py-3 ${STATUS_CLASS[status]
                      .split(" ")
                      .slice(1)
                      .join(" ")}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-bold ${STATUS_CLASS[status].split(" ")[0]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                      <strong
                        className={`text-sm font-bold ${STATUS_CLASS[status].split(" ")[0]}`}
                      >
                        {count}
                      </strong>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                      {STATUS_EXPLANATION[status]}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {/* En çok sipariş edilen + QR Oturumları */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
        {/* Top menu items */}
        <section className="kok-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[var(--accent)]">restaurant_menu</span>
            <div>
              <h2 className="text-base font-bold text-[var(--text-1)]">En Çok Sipariş Edilen</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Bu masada · tamamlanan siparişler
              </p>
            </div>
          </div>
          {topItems.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              Bu masada ürün verisi bulunamadı
            </p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[20px_1fr_72px] items-center gap-3"
                >
                  <span className="text-xs font-bold text-[var(--text-muted)] text-right">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-[var(--text-1)] truncate">
                        {item.name}
                      </span>
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
                          width: `${Math.max(8, Math.round((item.count / maxItemCount) * 100))}%`,
                          background: CATEGORY_COLORS[item.category] ?? "#7C6CF6",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--text-1)]">{item.count}×</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      ₺{item.revenue.toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QR Oturumları */}
        <section className="kok-card rounded-3xl overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--text-1)]">QR Oturumları</h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Bu masaya yapılan son QR taramaları
            </p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {detail.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--text-1)]">
                    {new Date(scan.scanned_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{scan.zone}</p>
                </div>
                <span className="kok-soft-button rounded-full px-3 py-1 text-xs font-bold text-[var(--accent)]">
                  {scan.duration_minutes} dk
                </span>
              </div>
            ))}
          </div>
          {detail.recentScans.length === 0 && (
            <div className="kok-empty py-14 text-center text-sm text-[var(--text-2)]">
              Bu masada QR oturumu bulunamadı.
            </div>
          )}
        </section>
      </div>

      {/* Son siparişler — tam genişlik */}
      <section className="kok-card rounded-3xl overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-1)]">Son Siparişler</h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">Bu masadaki son 12 sipariş</p>
          </div>
          {hasPending && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <span className="material-symbols-outlined text-xs leading-none">
                hourglass_empty
              </span>
              {detail.statusBreakdown.pending} bekliyor
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <th className="px-6 py-3">Sipariş</th>
                <th className="px-6 py-3">Tutar</th>
                <th className="px-6 py-3 min-w-[240px]">Ne yendi / içildi</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Zaman</th>
              </tr>
            </thead>
            <tbody>
              {detail.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-t border-[var(--border)] hover:bg-white/[0.025] transition-colors ${
                    order.status === "pending" ? "bg-amber-500/[0.03]" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-[var(--text-1)]">#{order.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[var(--accent)]">
                    ₺{Number(order.total_amount).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {(order.items ?? []).map((item, itemIdx) => (
                        <div
                          key={`${order.id}-${itemIdx}`}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="text-[var(--text-1)]">
                            {item.quantity}× {item.name}
                            <span className="ml-1 text-[var(--text-muted)]">
                              ({item.category})
                            </span>
                          </span>
                          <span className="font-bold text-[var(--text-2)] whitespace-nowrap">
                            ₺{item.total.toLocaleString("tr-TR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        STATUS_CLASS[order.status]
                      }`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-2)]">
                    {new Date(order.created_at).toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {detail.recentOrders.length === 0 && (
          <div className="kok-empty py-14 text-center text-sm text-[var(--text-2)]">
            Bu masada henüz sipariş yok.
          </div>
        )}
      </section>
    </main>
  );
}
