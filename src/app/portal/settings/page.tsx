import { getCurrentBusiness, trialDaysLeft } from "@/lib/business-session";

export default async function PortalSettingsPage() {
  const business = await getCurrentBusiness();
  const trialLeft = trialDaysLeft(business);

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">İşletme Ayarları</h1>
        <p className="text-[var(--text-2)] text-sm font-medium">Profil, plan ve erişim bilgileri</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-7 kok-card rounded-3xl p-8">
          <h2 className="text-base font-bold text-[var(--text-1)] mb-6">Profil</h2>
          <div className="grid gap-5">
            {[
              ["İşletme Adı", business.name],
              ["Şehir", business.city],
              ["E-posta", business.owner_email ?? "-"],
              ["Plan", business.plan.toUpperCase()],
              ["Durum", business.status],
            ].map(([label, value]) => (
              <label key={label} className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
                <input readOnly value={value} className="w-full bg-black/20 border border-[var(--border)] rounded-2xl py-2.5 px-4 text-sm text-[var(--text-1)]" />
              </label>
            ))}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 kok-card rounded-3xl p-8">
          <h2 className="text-base font-bold text-[var(--text-1)] mb-4">Trial ve Ödeme</h2>
          <p className="text-sm text-[var(--text-2)] leading-relaxed">
            Trial süresi kayıtla birlikte başlar ve maksimum 7 gündür. Ödeme entegrasyonu ana proje ile bağlandığında,
            aynı Supabase hesabı ile bu panele erişim devam eder.
          </p>
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-black/20 p-5">
            <p className="text-3xl font-black text-[var(--accent)]">{trialLeft ?? "-"}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Kalan trial günü</p>
          </div>
        </section>
      </div>
    </main>
  );
}
