import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business-session";
import {
  getConversionRate,
  getOrderStats,
  getOrders,
  getTopMenuItems,
} from "@/lib/queries";

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

const PERIOD_LABELS: Record<string, string> = {
  all: "Tümü",
  today: "Bugün",
  "7d": "Son 7 Gün",
  "30d": "Son 30 Gün",
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

export default async function PortalOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; period?: string }>;
}) {
  const business = await getCurrentBusiness();
  const { q = "", period = "all" } = await searchParams;
  const businessId = Number(business.id);
  const activePeriod = Object.keys(PERIOD_LABELS).includes(period) ? period : "all";
  const queryPeriod = activePeriod === "all" ? undefined : activePeriod;

  const [ordersRes, statsRes, conversionRes, topItemsRes] = await Promise.all([
    getOrders(100, "created_at", "desc", q, businessId, queryPeriod),
    getOrderStats(businessId, queryPeriod),
    getConversionRate(businessId),
    getTopMenuItems(6, businessId, queryPeriod),
  ]);

  const topItems = topItemsRes.data;
  const maxCount = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">Siparişler</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">{business.name} masa siparişleri</p>
        </div>
        <form method="get" className="flex items-center gap-2 max-w-sm w-full">
          <input type="hidden" name="period" value={activePeriod} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Masa veya bölge ara..."
            className="w-full bg-black/20 border border-[var(--border)] rounded-full py-2.5 px-4 text-sm text-[var(--text-1)]"
          />
          <button className="kok-gradient-button text-white px-4 py-2.5 rounded-full text-xs font-bold">Ara</button>
        </form>
      </div>

      {/* Period filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(PERIOD_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`?period=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              activePeriod === key
                ? "kok-gradient-button text-white border-transparent"
                : "kok-soft-button text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-1)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Sol: KPI kartlar + sipariş tablosu */}
        <div className="xl:col-span-2 space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="kok-card rounded-3xl p-6">
              <p className="text-2xl font-black text-[var(--text-1)]">
                ₺{statsRes.data.totalRevenue.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Toplam ciro</p>
            </div>
            <div className="kok-card rounded-3xl p-6">
              <p className="text-2xl font-black text-[var(--text-1)]">{statsRes.data.completed}</p>
              <p className="text-xs text-[var(--text-muted)]">Tamamlanan sipariş</p>
            </div>
            <div className="kok-card rounded-3xl p-6">
              <p className="text-2xl font-black text-[var(--accent)]">%{conversionRes.data.rate}</p>
              <p className="text-xs text-[var(--text-muted)]">Tarama → sipariş dönüşümü</p>
            </div>
          </div>

          {/* İptal / Bekleyen uyarıları */}
          {(statsRes.data.pending > 0 || statsRes.data.cancelled > 0) && (
            <div className="flex flex-wrap gap-3">
              {statsRes.data.pending > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                  {statsRes.data.pending} bekleyen sipariş
                </div>
              )}
              {statsRes.data.cancelled > 0 && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-400/20 text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  %{statsRes.data.cancelRate} iptal oranı ({statsRes.data.cancelled} sipariş)
                </div>
              )}
            </div>
          )}

          {/* Sipariş tablosu */}
          <section className="kok-card rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-1)]">Sipariş Listesi</h2>
              <span className="kok-soft-button rounded-full px-3 py-1 text-[10px] font-bold text-[var(--accent)]">
                {ordersRes.data.length} sipariş
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    <th className="px-6 py-4">Sipariş</th>
                    <th className="px-6 py-4">Masa / Bölge</th>
                    <th className="px-6 py-4">Tutar</th>
                    <th className="px-6 py-4 min-w-[220px]">İçerik</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4">Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersRes.data.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--border)] hover:bg-white/[0.025]">
                      <td className="px-6 py-4 font-bold text-[var(--text-1)]">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[var(--text-1)]">{order.table_id}</p>
                        <p className="text-xs text-[var(--text-muted)]">{order.zone}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--accent)]">
                        ₺{Number(order.total_amount).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {(order.items ?? []).map((item, idx) => (
                            <div
                              key={`${order.id}-${idx}`}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="text-[var(--text-1)]">
                                {item.quantity}x {item.name}
                                <span className="ml-1 text-[var(--text-muted)]">({item.category})</span>
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
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[order.status]}`}
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-2)] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {ordersRes.data.length === 0 && (
              <div className="kok-empty py-20 text-center">
                <p className="text-lg font-bold text-[var(--text-1)]">Bu dönemde sipariş yok</p>
                <Link
                  href="/portal/analytics"
                  className="text-sm text-[var(--accent)] font-semibold mt-2 inline-block"
                >
                  Analitiğe dön
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sağ: En Çok Sipariş Edilen */}
        <aside className="space-y-6">
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-[var(--accent)]">restaurant_menu</span>
              <div>
                <h2 className="text-base font-bold text-[var(--text-1)]">En Çok Sipariş Edilen</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{PERIOD_LABELS[activePeriod]}</p>
              </div>
            </div>
            <div className="space-y-4">
              {topItems.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] w-4 text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-[var(--text-1)] truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-extrabold text-[var(--text-1)] flex-shrink-0">{item.count}x</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(8, Math.round((item.count / maxCount) * 100))}%`,
                        background: CATEGORY_COLORS[item.category] ?? "#7C6CF6",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span
                      style={{ color: CATEGORY_COLORS[item.category] ?? "#9AA3B2" }}
                    >
                      {item.category}
                    </span>
                    <span>₺{item.revenue.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              ))}
              {topItems.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">Bu dönem sipariş yok</p>
              )}
            </div>
          </section>

          {/* Sipariş Özeti */}
          <section className="kok-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-[var(--accent)]">fact_check</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">Durum Özeti</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Tamamlandı", value: statsRes.data.completed, cls: "text-emerald-300" },
                { label: "Bekliyor", value: statsRes.data.pending, cls: "text-amber-300" },
                { label: "İptal", value: statsRes.data.cancelled, cls: "text-rose-300" },
              ].map(({ label, value, cls }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3"
                >
                  <span className="text-sm text-[var(--text-2)]">{label}</span>
                  <strong className={`text-sm font-bold ${cls}`}>{value}</strong>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3">
                <span className="text-sm text-[var(--text-2)]">Ort. hesap</span>
                <strong className="text-sm font-bold text-[var(--text-1)]">
                  ₺{statsRes.data.avgAmount.toLocaleString("tr-TR")}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
