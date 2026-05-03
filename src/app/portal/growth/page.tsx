import { getCurrentBusiness, trialDaysLeft } from "@/lib/business-session";
import {
  getConversionRate,
  getOrderStats,
  getRevenueByDay,
  getRevenueByZone,
  getTopMenuItems,
  getWeeklyStats,
} from "@/lib/queries";
import RevenueTrendChart from "@/components/charts/RevenueTrendChart";

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

export default async function PortalGrowthPage() {
  const business = await getCurrentBusiness();
  const businessId = Number(business.id);

  const [weeklyRes, orderRes, conversionRes, revenueRes, zoneRes, topItemsRes] = await Promise.all([
    getWeeklyStats(businessId),
    getOrderStats(businessId),
    getConversionRate(businessId),
    getRevenueByDay(14, businessId),
    getRevenueByZone(businessId),
    getTopMenuItems(10, businessId),
  ]);

  const trialLeft = trialDaysLeft(business);
  const topItems = topItemsRes.data;
  const maxItemCount = Math.max(...topItems.map((i) => i.count), 1);
  const maxZoneRevenue = Math.max(...zoneRes.data.map((z) => z.revenue), 1);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8">
        <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Büyüme
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">İşletme Büyümesi</h1>
        <p className="text-[var(--text-2)] text-sm font-medium">
          {business.name} · ciro, dönüşüm ve menü performansı
        </p>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="kok-card rounded-3xl p-6">
          <p className="text-3xl font-black text-[var(--text-1)]">{weeklyRes.data.total}</p>
          <p className="text-xs text-[var(--text-muted)]">Haftalık tarama</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            En iyi gün: {weeklyRes.data.bestDay} · {weeklyRes.data.avgPerDay}/gün ort.
          </p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-3xl font-black text-[var(--text-1)]">
            ₺{orderRes.data.totalRevenue.toLocaleString("tr-TR")}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Toplam ciro</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Ort. hesap ₺{orderRes.data.avgAmount.toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-3xl font-black text-[var(--accent)]">%{conversionRes.data.rate}</p>
          <p className="text-xs text-[var(--text-muted)]">Tarama → sipariş dönüşümü</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {conversionRes.data.orderCount} sipariş / {conversionRes.data.scanCount} tarama
          </p>
        </div>
        <div className="kok-card rounded-3xl p-6">
          <p className="text-3xl font-black text-[var(--accent)]">{trialLeft ?? "–"}</p>
          <p className="text-xs text-[var(--text-muted)]">Kalan trial günü</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">{business.plan.toUpperCase()} planı</p>
        </div>
      </div>

      {/* Ciro Trendi */}
      <div className="mb-8">
        <RevenueTrendChart
          data={revenueRes.data}
          title="14 Günlük Ciro Trendi"
          subtitle="Tamamlanan siparişlere göre günlük ciro"
        />
      </div>

      {/* Menü Analizi + Bölge Bazlı Ciro */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* En Çok Sipariş Edilen */}
        <section className="kok-card rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Menü Performansı</h2>
            <p className="text-sm text-[var(--text-2)] mt-1">En çok sipariş edilen ürünler · tüm zamanlar</p>
          </div>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div key={item.name} className="grid grid-cols-[20px_1fr_80px] items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)] text-right">{idx + 1}</span>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
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
                        width: `${Math.max(6, Math.round((item.count / maxItemCount) * 100))}%`,
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
        </section>

        {/* Bölge Bazlı Ciro */}
        <section className="kok-card rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--text-1)]">Bölge Bazlı Ciro</h2>
            <p className="text-sm text-[var(--text-2)] mt-1">Tamamlanan siparişlere göre bölge kırılımı</p>
          </div>
          {zoneRes.data.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Bölge verisi yok</div>
          ) : (
            <div className="space-y-4">
              {zoneRes.data.map((zone) => (
                <div key={zone.zone}>
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-1)]">{zone.zone}</span>
                      <span className="text-xs text-[var(--text-muted)]">{zone.orders} sipariş</span>
                    </div>
                    <span className="text-sm font-extrabold text-[var(--accent)]">
                      ₺{zone.revenue.toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6D5DF7] to-[#C084FC]"
                      style={{
                        width: `${Math.max(6, Math.round((zone.revenue / maxZoneRevenue) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">
                    %{Math.round((zone.revenue / zoneRes.data.reduce((s, z) => s + z.revenue, 0)) * 100)} toplam cirodan
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sipariş İptal + Ortalama Hesap Detayı */}
      <section className="kok-card rounded-3xl p-8">
        <h2 className="text-lg font-bold text-[var(--text-1)] mb-2">Sipariş Kalitesi</h2>
        <p className="text-sm text-[var(--text-2)] mb-6">İptal oranı ve ortalama hesap sağlıklı işletmenin göstergesidir</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-black text-emerald-400">{orderRes.data.completed}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Tamamlanan sipariş</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-rose-400">%{orderRes.data.cancelRate}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">İptal oranı</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-[var(--accent)]">
              ₺{orderRes.data.avgAmount.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Ortalama hesap</p>
          </div>
        </div>
      </section>
    </main>
  );
}
