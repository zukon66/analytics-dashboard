import Link from "next/link";
import {
  getMrrTrend,
  getCurrentMrr,
  getTrialExpirations,
  getNewRegistrations,
  getActivationFunnel,
  getPlatformKPIs,
} from "@/lib/queries";
import MrrTrendChart from "@/components/charts/MrrTrendChart";
import TrialExpirationList from "@/components/TrialExpirationList";
import NewRegistrationsList from "@/components/NewRegistrationsList";
import ActivationFunnelChart from "@/components/charts/ActivationFunnelChart";
import ReportCard from "@/components/ReportCard";
import t from "@/lib/i18n";

export const revalidate = 60;

export default async function GrowthPage() {
  const [mrrTrendRes, currentMrrRes, trialRes, newBizRes, funnelRes, kpisRes] = await Promise.all([
    getMrrTrend(),
    getCurrentMrr(),
    getTrialExpirations(14),
    getNewRegistrations(30),
    getActivationFunnel(),
    getPlatformKPIs(),
  ]);

  return (
    <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[var(--bg-page)]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="px-3 py-1 bg-[var(--accent-bg)] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Büyüme Paneli
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">
            {t.growth.title}
          </h1>
          <p className="text-[var(--text-2)] text-sm font-medium">{t.growth.subtitle}</p>
        </div>
        <Link
          href="/"
          className="text-xs text-[#7C6CF6] font-semibold flex items-center gap-1 hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Ana Panel
        </Link>
      </div>

      {/* Satır 1: MRR Trendi — tam genişlik */}
      <div className="mb-6">
        <MrrTrendChart
          data={mrrTrendRes.data}
          currentMrr={currentMrrRes.data.totalMrr}
          breakdown={currentMrrRes.data.breakdown}
        />
      </div>

      {/* Satır 2: Trial Uyarıları + Aktivasyon Hunisi */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-7 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden min-h-[340px]">
          <TrialExpirationList items={trialRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] min-h-[340px]">
          <ActivationFunnelChart funnel={funnelRes.data} />
        </div>
      </div>

      {/* Satır 3: Yeni Kayıtlar + Rapor indirme */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <NewRegistrationsList items={newBizRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ReportCard
            totalMrr={currentMrrRes.data.totalMrr}
            mrrTrend={mrrTrendRes.data}
            breakdown={currentMrrRes.data.breakdown}
            trials={trialRes.data}
            newRegs={newBizRes.data}
            totalBusinesses={kpisRes.data.totalBusinesses}
            activeBusinesses={kpisRes.data.activeBusinesses}
          />
        </div>
      </div>
    </main>
  );
}
