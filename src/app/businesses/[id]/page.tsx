import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getBusinessById,
  getScansByHour,
  getScansByCity,
  getScansByZone,
  getTopTables,
  getPeriodKPIs,
  getComparisonKPIs,
  getOrderStats,
  getCustomerStats,
  getPlatformAverages,
} from "@/lib/queries";
import HourlyScansChart from "@/components/charts/HourlyScansChart";
import CityMapChart from "@/components/charts/CityMapChart";
import ZoneChart from "@/components/charts/ZoneChart";
import DateFilterBar from "@/components/DateFilterBar";
import PlatformComparisonBadge from "@/components/PlatformComparisonBadge";
import {
  extendBusinessTrial,
  updateBusinessPlan,
  updateBusinessStatus,
  updateBusinessTrialEnd,
} from "@/app/actions/admin-business";
import { getAdminBusinessOperations } from "@/lib/admin-business";
import t from "@/lib/i18n";

export const revalidate = 60;

const VALID_PERIODS = ["today", "7d", "30d"];
const PERIOD_LABEL: Record<string, string> = { today: "Bugün", "7d": "Son 7 Gün", "30d": "Son 30 Gün" };

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

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  trial: "Trial",
  churned: "Ayrıldı",
};

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
      {up ? "↑" : "↓"} %{Math.abs(pct)}
    </span>
  );
}

function formatTrialDate(value?: string | null): string {
  if (!value) return "Belirtilmemiş";
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function trialDaysLeft(value?: string | null): string {
  if (!value) return "--";
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Süresi doldu";
  return `${days} gün kaldı`;
}

function formatAdminDate(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default async function BusinessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    period?: string;
    date?: string;
    trial?: string;
    trial_error?: string;
    operation?: string;
    operation_error?: string;
  }>;
}) {
  const { id } = await params;
  const businessId = Number(id);
  if (isNaN(businessId)) notFound();

  const { data: business } = await getBusinessById(businessId);
  if (!business) notFound();

  const pageParams = await searchParams;
  const { period = "7d", date } = pageParams;
  const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const activePeriod = VALID_PERIODS.includes(period) ? period : "7d";
  const queryKey = isValidDate ? date : activePeriod;

  const [hourlyRes, cityRes, zoneRes, topTablesRes, kpisRes, prevKpisRes, orderStatsRes, customerStatsRes, platformAvgRes] =
    await Promise.all([
      getScansByHour(queryKey, businessId),
      getScansByCity(queryKey, businessId),
      getScansByZone(queryKey, businessId),
      getTopTables(10, queryKey, businessId),
      getPeriodKPIs(queryKey, businessId),
      getComparisonKPIs(queryKey, businessId),
      getOrderStats(businessId),
      getCustomerStats(businessId),
      getPlatformAverages(activePeriod),
    ]);
  const adminOps = await getAdminBusinessOperations(businessId);
  const platformAvg = platformAvgRes.data;

  const kpis = kpisRes.data;
  const prevKpis = prevKpisRes.data;
  const periodDisplayLabel = isValidDate ? date : (PERIOD_LABEL[activePeriod] ?? "Son 7 Gün");

  const kpiCards = [
    { label: `${periodDisplayLabel} Tarama`, value: kpis.totalScans.toLocaleString("tr-TR"), prev: prevKpis.totalScans, icon: "qr_code_scanner", iconBg: "bg-[var(--accent-bg)]", iconColor: "text-[#7C6CF6]", platformBizValue: kpis.totalScans, platformAvg: platformAvg.avgScans },
    { label: t.dashboard.kpis.peakHour, value: kpis.peakHour, prev: null, icon: "schedule", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1E40AF]", platformBizValue: null, platformAvg: 0 },
    { label: "Toplam Gelir", value: `₺${orderStatsRes.data.totalRevenue.toLocaleString("tr-TR")}`, prev: null, icon: "payments", iconBg: "bg-[#EDE9FE]", iconColor: "text-[#6D28D9]", platformBizValue: orderStatsRes.data.totalRevenue, platformAvg: platformAvg.avgRevenue },
    { label: "Toplam Müşteri", value: String(customerStatsRes.data.total), prev: null, icon: "group", iconBg: "bg-[var(--bg-sidebar)]", iconColor: "text-[var(--text-2)]", platformBizValue: customerStatsRes.data.total, platformAvg: platformAvg.avgCustomers },
  ];

  return (
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Geri + Başlık */}
      <div className="mb-8">
        <Link href="/businesses" className="text-xs text-[#7C6CF6] font-semibold flex items-center gap-1 mb-4 hover:underline w-fit">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Tüm İşletmeler
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl kok-icon-tile flex items-center justify-center text-[var(--accent)] font-extrabold text-lg">
                {business.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-1)]">{business.name}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[business.plan] ?? ""}`}>
                    {business.plan}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[business.status] ?? ""}`}>
                    {t.businesses.status[business.status as keyof typeof t.businesses.status] ?? business.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-2)]">{business.city} · {business.owner_email ?? "—"}</p>
              </div>
            </div>
          </div>
          <DateFilterBar activePeriod={activePeriod} activeDate={isValidDate ? date : undefined} />
        </div>
      </div>

      {/* KPI Şeridi */}
      {(pageParams.trial || pageParams.trial_error) && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            pageParams.trial === "extended"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/20 bg-amber-500/10 text-amber-300"
          }`}
        >
          {pageParams.trial === "extended"
            ? "Trial süresi güncellendi."
            : "Trial süresi gerçek Supabase verisine uygulanamadı. Migration çalışmadıysa veya mock fallback aktifse bu beklenen bir durumdur."}
        </div>
      )}

      {(pageParams.operation || pageParams.operation_error) && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            pageParams.operation
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/20 bg-amber-500/10 text-amber-300"
          }`}
        >
          {pageParams.operation
            ? "Admin işlemi başarıyla uygulandı."
            : "Admin işlemi uygulanamadı. Supabase service role env değerlerini ve bağlantıyı kontrol edin."}
        </div>
      )}

      <section className="kok-card rounded-3xl p-5 md:p-6 mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[var(--accent)]">hourglass_top</span>
              <h2 className="text-base font-bold text-[var(--text-1)]">Trial Yönetimi</h2>
            </div>
            <p className="text-sm text-[var(--text-2)]">
              Bitiş: <span className="font-bold text-[var(--text-1)]">{formatTrialDate(business.trial_ends_at)}</span>
              <span className="mx-2 text-[var(--text-muted)]">•</span>
              {trialDaysLeft(business.trial_ends_at)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Admin uzatması işlem anından itibaren en fazla 7 güne kadar sınırlandırılır.
            </p>
          </div>

          <form action={extendBusinessTrial} className="flex flex-wrap gap-2">
            <input type="hidden" name="businessId" value={business.id} />
            {[1, 3, 7].map((days) => (
              <button
                key={days}
                type="submit"
                name="extendDays"
                value={days}
                className="kok-soft-button rounded-full px-4 py-2 text-xs font-bold text-[var(--accent)] hover:border-[#7C6CF6]/60 transition-colors"
              >
                +{days} gün
              </button>
            ))}
          </form>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        <div className="kok-card rounded-3xl p-5 md:p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[var(--accent)]">admin_panel_settings</span>
            <h2 className="text-base font-bold text-[var(--text-1)]">Admin Operasyonları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form action={updateBusinessPlan} className="rounded-2xl border border-[var(--border)] bg-white/[0.025] p-4">
              <input type="hidden" name="businessId" value={business.id} />
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                Plan değiştir
              </label>
              <select
                name="plan"
                defaultValue={business.plan_code ?? business.plan}
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--text-1)]"
              >
                {Object.entries(PLAN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button className="kok-gradient-button mt-3 w-full rounded-xl px-3 py-2 text-xs font-bold text-white">
                Planı Kaydet
              </button>
            </form>

            <form action={updateBusinessStatus} className="rounded-2xl border border-[var(--border)] bg-white/[0.025] p-4">
              <input type="hidden" name="businessId" value={business.id} />
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                İşletme durumu
              </label>
              <select
                name="status"
                defaultValue={business.status}
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--text-1)]"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button className="kok-gradient-button mt-3 w-full rounded-xl px-3 py-2 text-xs font-bold text-white">
                Durumu Kaydet
              </button>
            </form>

            <form action={updateBusinessTrialEnd} className="rounded-2xl border border-[var(--border)] bg-white/[0.025] p-4">
              <input type="hidden" name="businessId" value={business.id} />
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                Trial bitiş tarihi
              </label>
              <input
                name="trialEndsAt"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(business.trial_ends_at)}
                className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2 text-sm text-[var(--text-1)]"
              />
              <button className="kok-gradient-button mt-3 w-full rounded-xl px-3 py-2 text-xs font-bold text-white">
                Tarihi Kaydet
              </button>
            </form>
          </div>
        </div>

        <aside className="kok-card rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[var(--accent)]">link</span>
            <h2 className="text-base font-bold text-[var(--text-1)]">Kullanıcı Eşleşmesi</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Owner e-posta</p>
              <p className="mt-1 break-all text-[var(--text-1)]">{business.owner_email ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Auth user id</p>
              <p className="mt-1 break-all text-[var(--text-2)]">{business.auth_user_id ?? "Eşleşme yok"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ana proje user id</p>
              <p className="mt-1 break-all text-[var(--text-2)]">{business.external_project_user_id ?? "Henüz bağlı değil"}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
        <div className="kok-card rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-[var(--text-1)]">Business Üyeleri</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Supabase Auth kullanıcıları ile işletme eşleşmesi</p>
          </div>
          {adminOps.error ? (
            <div className="px-6 py-8 text-sm text-amber-300">
              Admin veri bağlantısı okunamadı: {adminOps.error}
            </div>
          ) : adminOps.members.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[var(--text-muted)]">Bu işletmeye bağlı kullanıcı yok.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {adminOps.members.map((member) => (
                <div key={member.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-all text-sm font-bold text-[var(--text-1)]">{member.auth_user_id}</p>
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--accent)]">
                      {member.role} · {member.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Bağlantı: {formatAdminDate(member.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="kok-card rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <h2 className="text-base font-bold text-[var(--text-1)]">Ödeme ve Abonelik</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Plan, ödeme durumu ve son ödeme tarihleri</p>
          </div>
          {adminOps.error ? (
            <div className="px-6 py-8 text-sm text-amber-300">
              Ödeme verileri okunamadı: {adminOps.error}
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Abonelikler</h3>
                {adminOps.subscriptions.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Abonelik kaydı yok.</p>
                ) : (
                  <div className="space-y-2">
                    {adminOps.subscriptions.map((subscription) => (
                      <div key={subscription.id} className="rounded-2xl border border-[var(--border)] bg-white/[0.025] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm text-[var(--text-1)]">{PLAN_LABELS[subscription.plan_code]}</strong>
                          <span className="text-xs font-bold text-[var(--accent)]">{subscription.status}</span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          Dönem: {formatAdminDate(subscription.current_period_started_at)} → {formatAdminDate(subscription.current_period_ends_at)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          Trial: {formatAdminDate(subscription.trial_started_at)} → {formatAdminDate(subscription.trial_ends_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Ödemeler</h3>
                {adminOps.payments.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Ödeme kaydı yok.</p>
                ) : (
                  <div className="space-y-2">
                    {adminOps.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white/[0.025] p-4">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-1)]">
                            {Number(payment.amount).toLocaleString("tr-TR")} {payment.currency}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {payment.provider ?? "provider yok"} · {formatAdminDate(payment.paid_at ?? payment.created_at)}
                          </p>
                        </div>
                        <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--accent)]">
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="kok-card kok-card-hover rounded-3xl p-5 flex items-center gap-4">
            <div className={`kok-icon-tile p-3 rounded-2xl ${kpi.iconBg} ${kpi.iconColor}`}>
              <span className="material-symbols-outlined">{kpi.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xl font-extrabold text-[var(--text-1)]">{kpi.value}</p>
                {kpi.prev !== null && typeof kpi.prev === "number" && (
                  <DeltaBadge current={Number(String(kpi.value).replace(/\D/g, "")) || 0} previous={kpi.prev} />
                )}
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter truncate">{kpi.label}</p>
              {kpi.platformBizValue !== null && (
                <PlatformComparisonBadge bizValue={kpi.platformBizValue} platformAvg={kpi.platformAvg} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler Sıra 1 */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <HourlyScansChart data={hourlyRes.data} period={queryKey} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CityMapChart data={cityRes.data} />
        </div>
      </div>

      {/* Grafikler Sıra 2 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <ZoneChart data={zoneRes.data} />
        </div>
        <div className="col-span-12 lg:col-span-8 kok-card rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text-1)]">{t.dashboard.topTables.title}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.tableId}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.zone}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.dailyScans}</th>
                  <th className="px-8 py-4">{t.dashboard.topTables.cols.avgDuration}</th>
                </tr>
              </thead>
              <tbody>
                {topTablesRes.data.length === 0 ? (
                  <tr><td colSpan={4} className="kok-empty px-8 py-12 text-center text-[var(--text-muted)] text-sm">{periodDisplayLabel} için tarama verisi yok.</td></tr>
                ) : (
                  topTablesRes.data.map((table) => {
                    const maxScans = topTablesRes.data[0]?.scans ?? 1;
                    const pct = Math.round((table.scans / maxScans) * 100);
                    return (
                      <tr key={table.tableId} className="hover:bg-white/[0.035] transition-colors border-t border-[var(--border)]">
                        <td className="px-8 py-5"><span className="font-bold text-[var(--text-1)]">{table.tableId}</span></td>
                        <td className="px-8 py-5"><span className="text-sm text-[var(--text-2)]">{table.zone}</span></td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-1)]">{table.scans}</span>
                            <div className="w-16 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full bg-[#7C6CF6]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[var(--text-2)]">{table.avgDuration} {t.common.minutes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
