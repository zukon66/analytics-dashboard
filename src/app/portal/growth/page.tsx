import { getCurrentBusiness, trialDaysLeft } from "@/lib/business-session";
import { getCustomerStats, getOrderStats, getWeeklyStats } from "@/lib/queries";

export default async function PortalGrowthPage() {
  const business = await getCurrentBusiness();
  const businessId = Number(business.id);
  const [weeklyRes, orderRes, customerRes] = await Promise.all([
    getWeeklyStats(businessId),
    getOrderStats(businessId),
    getCustomerStats(businessId),
  ]);
  const trialLeft = trialDaysLeft(business);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8">
        <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Büyüme
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">İşletme Büyümesi</h1>
        <p className="text-[var(--text-2)] text-sm font-medium">{business.name} için kullanıma geçiş ve performans özeti</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="kok-card rounded-3xl p-6"><p className="text-3xl font-black text-[var(--text-1)]">{weeklyRes.data.total}</p><p className="text-xs text-[var(--text-muted)]">Haftalık tarama</p></div>
        <div className="kok-card rounded-3xl p-6"><p className="text-3xl font-black text-[var(--text-1)]">₺{orderRes.data.totalRevenue.toLocaleString("tr-TR")}</p><p className="text-xs text-[var(--text-muted)]">Sipariş cirosu</p></div>
        <div className="kok-card rounded-3xl p-6"><p className="text-3xl font-black text-[var(--text-1)]">{customerRes.data.returning}</p><p className="text-xs text-[var(--text-muted)]">Tekrar müşteri</p></div>
        <div className="kok-card rounded-3xl p-6"><p className="text-3xl font-black text-[var(--accent)]">{trialLeft ?? "-"}</p><p className="text-xs text-[var(--text-muted)]">Kalan trial günü</p></div>
      </div>

      <section className="kok-card rounded-3xl p-8 mt-8">
        <h2 className="text-lg font-bold text-[var(--text-1)] mb-3">Ödeme Entegrasyonu</h2>
        <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-2xl">
          Bu panel ödeme alma sisteminin bir parçası olacak şekilde hazırlandı. Ana projede ödeme onayı alındığında
          aynı Supabase Auth kullanıcısı bu analitik panelde kendi işletme verilerine erişebilecek.
        </p>
      </section>
    </main>
  );
}
