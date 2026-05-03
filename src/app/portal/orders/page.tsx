import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business-session";
import { getConversionRate, getOrderStats, getOrders } from "@/lib/queries";

export default async function PortalOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const business = await getCurrentBusiness();
  const { q = "" } = await searchParams;
  const businessId = Number(business.id);

  const [ordersRes, statsRes, conversionRes] = await Promise.all([
    getOrders(50, "created_at", "desc", q, businessId),
    getOrderStats(businessId),
    getConversionRate(businessId),
  ]);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">Siparişler</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">{business.name} masa siparişleri</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6"><p className="text-2xl font-black text-[var(--text-1)]">₺{statsRes.data.totalRevenue.toLocaleString("tr-TR")}</p><p className="text-xs text-[var(--text-muted)]">Toplam ciro</p></div>
        <div className="kok-card rounded-3xl p-6"><p className="text-2xl font-black text-[var(--text-1)]">{statsRes.data.completed}</p><p className="text-xs text-[var(--text-muted)]">Tamamlanan sipariş</p></div>
        <div className="kok-card rounded-3xl p-6"><p className="text-2xl font-black text-[var(--text-1)]">%{conversionRes.data.rate}</p><p className="text-xs text-[var(--text-muted)]">Tarama → sipariş dönüşümü</p></div>
      </div>

      <section className="kok-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <th className="px-8 py-4">Sipariş</th>
                <th className="px-8 py-4">Masa</th>
                <th className="px-8 py-4">Bölge</th>
                <th className="px-8 py-4">Tutar</th>
                <th className="px-8 py-4">Sipariş içeriği</th>
                <th className="px-8 py-4">Durum</th>
                <th className="px-8 py-4">Zaman</th>
              </tr>
            </thead>
            <tbody>
              {ordersRes.data.map((order) => (
                <tr key={order.id} className="border-t border-[var(--border)] hover:bg-white/[0.035]">
                  <td className="px-8 py-4 font-bold text-[var(--text-1)]">#{order.id}</td>
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{order.table_id}</td>
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{order.zone}</td>
                  <td className="px-8 py-4 font-bold text-[var(--accent)]">₺{Number(order.total_amount).toLocaleString("tr-TR")}</td>
                  <td className="px-8 py-4 min-w-[260px]">
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
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{order.status}</td>
                  <td className="px-8 py-4 text-sm text-[var(--text-2)]">{new Date(order.created_at).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ordersRes.data.length === 0 && (
          <div className="kok-empty py-20 text-center">
            <p className="text-lg font-bold text-[var(--text-1)]">Henüz sipariş yok</p>
            <Link href="/portal/analytics" className="text-sm text-[var(--accent)] font-semibold mt-2 inline-block">Analitiğe dön</Link>
          </div>
        )}
      </section>
    </main>
  );
}
