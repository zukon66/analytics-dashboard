import Link from "next/link";
import {
  getPlatformKPIs,
  getChurnRiskBusinesses,
  getBusinesses,
  getBusinessScanCounts,
  getScansByHour,
  getScansByCity,
  getScansByPlan,
  getTrialExpirations,
  getActivationFunnel,
  getNewRegistrations,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityScansChart from "@/components/charts/CityScansChart";
import ZoneChart from "@/components/charts/ZoneChart";
import GrowthSummaryCard from "@/components/GrowthSummaryCard";
import ActivityLog from "@/components/ActivityLog";
import t from "@/lib/i18n";

export const revalidate = 60;

const PLAN_COLORS: Record<string, string> = {
  trial:      "bg-[#F3F4F6] text-[#6B7280]",
  starter:    "bg-[#DBEAFE] text-[#1E40AF]",
  pro:        "bg-[#EDE9FE] text-[#6D28D9]",
  enterprise: "bg-[#FEF3C7] text-[#92400E]",
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-[#DCFCE7] text-[#15803D]",
  inactive: "bg-[#FEF3C7] text-[#92400E]",
  churned:  "bg-[#FEE2E2] text-[#991B1B]",
  trial:    "bg-[#F3F4F6] text-[#6B7280]",
};

function KPICard({
  label, value, icon, iconBg, iconColor, sub,
}: {
  label: string; value: string; icon: string;
  iconBg: string; iconColor: string; sub?: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-6 flex items-center gap-4 border border-[var(--border)]">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-[var(--text-1)]">{value}</p>
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{label}</p>
        {sub && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return "—";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

export default async function PlatformOverviewPage() {
  const [kpisRes, churnRes, bizRes, hourlyRes, cityRes, zoneRes, trialRes, funnelRes, newBizRes] = await Promise.all([
    getPlatformKPIs(),
    getChurnRiskBusinesses(14),
    getBusinesses(),
    getScansByHour("7d"),
    getScansByCity("7d"),
    getScansByPlan("7d"),
    getTrialExpirations(14),
    getActivationFunnel(),
    getNewRegistrations(30),
  ]);

  const kpis = kpisRes.data;
  const churnList = churnRes.data;
  const allBusinesses = bizRes.data;

  // İşletme bazlı scan sayıları (son 7 gün)
  const scanCounts = await getBusinessScanCounts(allBusinesses.map((b) => b.id), 7);

  // En aktif 5 işletme
  const topBusinesses = [...allBusinesses]
    .sort((a, b) => (scanCounts[b.id] ?? 0) - (scanCounts[a.id] ?? 0))
    .slice(0, 5);

  const kpiCards = [
    { label: t.platform.kpis.totalBusinesses, value: String(kpis.totalBusinesses), icon: "store", iconBg: "bg-[#EEEAFE]", iconColor: "text-[#7C6CF6]" },
    { label: t.platform.kpis.activeBusinesses, value: String(kpis.activeBusinesses), icon: "check_circle", iconBg: "bg-[#DCFCE7]", iconColor: "text-[#15803D]" },
    { label: t.platform.kpis.churnRisk, value: String(kpis.churnRiskCount), icon: "warning", iconBg: "bg-[#FEF3C7]", iconColor: "text-[#92400E]", sub: "Son 14 günde aktif değil" },
    { label: t.platform.kpis.scansWeek, value: kpis.totalScansWeek.toLocaleString("tr-TR"), icon: "qr_code_scanner", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]" },
    { label: t.platform.kpis.scansToday, value: kpis.totalScansToday.toLocaleString("tr-TR"), icon: "today", iconBg: "bg-[#F3F4F6]", iconColor: "text-[#6B7280]" },
    { label: t.platform.kpis.totalRevenue, value: `₺${kpis.totalRevenueAllTime.toLocaleString("tr-TR")}`, icon: "payments", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]" },
  ];

  return (
    <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Internal Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">{t.platform.title}</h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.platform.subtitle}</p>
        </div>
        <Link
          href="/businesses"
          className="bg-[#7C6CF6] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#6D5DF0] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">store</span>
          {t.platform.viewAll}
        </Link>
      </div>

      {/* KPI Grid — 3 kolon */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {kpiCards.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* Büyüme Özeti Kartı */}
      <div className="mb-8">
        <GrowthSummaryCard
          trialCount={trialRes.data.length}
          newBizCount={newBizRes.data.length}
          activationRate={
            funnelRes.data.totalBusinesses > 0
              ? Math.round((funnelRes.data.activated1Plus / funnelRes.data.totalBusinesses) * 100)
              : 0
          }
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sol: En Aktif İşletmeler */}
        <div className="col-span-12 lg:col-span-7 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text-1)]">{t.platform.topBusinesses}</h3>
            <Link href="/businesses" className="text-xs text-[var(--accent)] font-semibold hover:underline">
              Tümünü Gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[480px]">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <th className="px-8 py-4">İşletme</th>
                <th className="px-4 py-4">Plan</th>
                <th className="px-4 py-4">Durum</th>
                <th className="px-4 py-4 text-right">7G Tarama</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {topBusinesses.map((biz) => {
                const scans = scanCounts[biz.id] ?? 0;
                return (
                  <tr key={biz.id} className="hover:bg-[var(--bg-page)] transition-colors border-t border-[var(--border)]">
                    <td className="px-8 py-4">
                      <p className="font-bold text-[var(--text-1)] text-sm">{biz.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{biz.city}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${PLAN_COLORS[biz.plan] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                        {biz.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[biz.status] ?? ""}`}>
                        {t.businesses.status[biz.status as keyof typeof t.businesses.status] ?? biz.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-[var(--text-1)]">{scans.toLocaleString("tr-TR")}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Link href={`/businesses/${biz.id}`} className="text-xs text-[var(--accent)] font-semibold hover:underline">
                        Detay →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* Sağ: Churn Riski */}
        <div className="col-span-12 lg:col-span-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#F59E0B]">warning</span>
            <h3 className="text-base font-bold text-[var(--text-1)]">{t.platform.churnSection}</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {churnList.length === 0 ? (
              <p className="px-6 py-10 text-sm text-[var(--text-muted)] text-center">{t.platform.churnEmpty}</p>
            ) : (
              churnList.map((biz) => (
                <div key={biz.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-page)] transition-colors">
                  <div>
                    <p className="font-bold text-[var(--text-1)] text-sm">{biz.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{biz.city} · {biz.plan}</p>
                    <p className="text-xs text-[#F59E0B] font-semibold mt-0.5">
                      Son aktif: {daysSince(biz.last_active_at)}
                    </p>
                  </div>
                  <Link href={`/businesses/${biz.id}`} className="text-xs text-[var(--accent)] font-semibold hover:underline shrink-0">
                    İncele →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Aktivite Günlüğü */}
      <div className="mt-8 mb-6">
        <ActivityLog
          newRegs={newBizRes.data}
          trials={trialRes.data}
          churnList={churnRes.data}
        />
      </div>

      {/* Tarama Grafikleri */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-1)]">Tarama Analitiği — Son 7 Gün</h2>
        </div>
        <div className="mb-6">
          <HourlyScansChart data={hourlyRes.data} period="7d" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <CityScansChart data={cityRes.data} />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <ZoneChart
              data={zoneRes.data}
              badge="Plan Dağılımı"
              title="Plana Göre Tarama"
              subtitle="Son 7 günde hangi plan daha aktif"
              totalLabel="Toplam Platform Taraması"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
