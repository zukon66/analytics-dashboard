import Link from "next/link";
import { getBusinesses, getBusinessScanCounts } from "@/lib/queries";
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

const STATUS_ICONS: Record<string, string> = {
  active:   "check_circle",
  inactive: "pause_circle",
  churned:  "cancel",
  trial:    "schedule",
};

function daysSince(dateStr: string | null): string {
  if (!dateStr) return "—";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  return `${days} gün önce`;
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; plan?: string }>;
}) {
  const { search = "", status = "", plan = "" } = await searchParams;

  const { data: businesses } = await getBusinesses(search);

  const filtered = businesses
    .filter((b) => !status || b.status === status)
    .filter((b) => !plan   || b.plan   === plan);

  const scanCounts = await getBusinessScanCounts(filtered.map((b) => b.id), 7);

  const statusGroups = {
    active:   businesses.filter((b) => b.status === "active").length,
    inactive: businesses.filter((b) => b.status === "inactive").length,
    churned:  businesses.filter((b) => b.status === "churned").length,
    trial:    businesses.filter((b) => b.status === "trial").length,
  };

  return (
    <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[var(--bg-page)]">
      {/* Başlık */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">{t.businesses.title}</h1>
        <p className="text-[#6B7280] text-sm font-medium">{t.businesses.subtitle}</p>
      </div>

      {/* Durum özeti */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["active", "inactive", "trial", "churned"] as const).map((s) => (
          <Link
            key={s}
            href={status === s ? "/businesses" : `/businesses?status=${s}`}
            className={`rounded-xl px-5 py-4 border flex items-center gap-3 transition-all ${
              status === s
                ? "border-[#7C6CF6] bg-[#EEEAFE]"
                : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[#7C6CF6]/40"
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${STATUS_COLORS[s].split(" ")[1]}`}>
              {STATUS_ICONS[s]}
            </span>
            <div>
              <p className="text-lg font-extrabold text-[var(--text-1)]">{statusGroups[s]}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                {t.businesses.status[s]}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Arama + Filtreler */}
      <form method="GET" action="/businesses" className="flex flex-wrap gap-2 mb-4">
        {/* Arama */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
          <input
            name="search"
            defaultValue={search}
            placeholder="İşletme, şehir veya e-posta..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2.5 pl-9 pr-4 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
          />
        </div>

        {/* Plan filtresi */}
        <select
          name="plan"
          defaultValue={plan}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2.5 px-3 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
        >
          <option value="">Tüm Planlar</option>
          <option value="trial">Trial</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        {/* Durum filtresi */}
        <select
          name="status"
          defaultValue={status}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2.5 px-3 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
        >
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="trial">Trial</option>
          <option value="inactive">Pasif</option>
          <option value="churned">Churn</option>
        </select>

        <button
          type="submit"
          className="bg-[#7C6CF6] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#6D5DF0] transition-colors"
        >
          Filtrele
        </button>

        {(search || status || plan) && (
          <a
            href="/businesses"
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#7C6CF6]/40 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Temizle
          </a>
        )}
      </form>

      {/* Aktif filtre bilgisi */}
      {(search || status || plan) && (
        <p className="text-xs text-[var(--text-muted)] mb-3">
          <span className="font-bold text-[var(--text-1)]">{filtered.length}</span> sonuç bulundu
          {search && <span> · Arama: <span className="font-semibold">"{search}"</span></span>}
          {plan && <span> · Plan: <span className="font-semibold capitalize">{plan}</span></span>}
          {status && <span> · Durum: <span className="font-semibold">{status}</span></span>}
        </p>
      )}

      {/* Tablo */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="px-8 py-4">{t.businesses.cols.name}</th>
              <th className="px-4 py-4">{t.businesses.cols.plan}</th>
              <th className="px-4 py-4">{t.businesses.cols.status}</th>
              <th className="px-4 py-4 text-right">{t.businesses.cols.scans7d}</th>
              <th className="px-4 py-4">{t.businesses.cols.lastActive}</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-[var(--text-muted)] text-sm">
                  {t.businesses.empty}
                </td>
              </tr>
            ) : (
              filtered.map((biz) => {
                const scans = scanCounts[biz.id] ?? 0;
                const isChurnRisk =
                  biz.status !== "churned" &&
                  biz.last_active_at &&
                  Math.floor((Date.now() - new Date(biz.last_active_at).getTime()) / 86400000) > 14;

                return (
                  <tr key={biz.id} className="hover:bg-[var(--bg-page)] transition-colors border-t border-[var(--border)]">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEEAFE] flex items-center justify-center text-[#7C6CF6] font-extrabold text-xs shrink-0">
                          {biz.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-1)] text-sm">{biz.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{biz.city} · {biz.owner_email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${PLAN_COLORS[biz.plan] ?? ""}`}>
                        {biz.plan}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[biz.status] ?? ""}`}>
                        {t.businesses.status[biz.status as keyof typeof t.businesses.status] ?? biz.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <span className="font-bold text-[var(--text-1)]">{scans.toLocaleString("tr-TR")}</span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`text-sm ${isChurnRisk ? "text-[#F59E0B] font-semibold" : "text-[#6B7280]"}`}>
                        {isChurnRisk && (
                          <span className="material-symbols-outlined text-xs align-middle mr-1">warning</span>
                        )}
                        {daysSince(biz.last_active_at)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/businesses/${biz.id}`}
                        className="text-xs text-[#7C6CF6] font-bold hover:underline"
                      >
                        {t.businesses.detail} →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </main>
  );
}
