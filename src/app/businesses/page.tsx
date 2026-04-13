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
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search = "", status = "" } = await searchParams;

  const { data: businesses } = await getBusinesses(search);

  const filtered = status
    ? businesses.filter((b) => b.status === status)
    : businesses;

  const scanCounts = await getBusinessScanCounts(filtered.map((b) => b.id), 7);

  const statusGroups = {
    active:   businesses.filter((b) => b.status === "active").length,
    inactive: businesses.filter((b) => b.status === "inactive").length,
    churned:  businesses.filter((b) => b.status === "churned").length,
    trial:    businesses.filter((b) => b.status === "trial").length,
  };

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">{t.businesses.title}</h1>
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
                : "border-[#E9E9F2] bg-white hover:border-[#7C6CF6]/40"
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${STATUS_COLORS[s].split(" ")[1]}`}>
              {STATUS_ICONS[s]}
            </span>
            <div>
              <p className="text-lg font-extrabold text-[#1F2430]">{statusGroups[s]}</p>
              <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tight">
                {t.businesses.status[s]}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Arama */}
      <div className="mb-4">
        <form method="GET" action="/businesses">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="İşletme, şehir veya e-posta ara..."
            className="w-full max-w-sm bg-white border border-[#E9E9F2] rounded-lg py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
          />
        </form>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-[#E9E9F2] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] border-b border-[#E9E9F2]">
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
                <td colSpan={6} className="px-8 py-16 text-center text-[#9AA3B2] text-sm">
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
                  <tr key={biz.id} className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEEAFE] flex items-center justify-center text-[#7C6CF6] font-extrabold text-xs shrink-0">
                          {biz.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2430] text-sm">{biz.name}</p>
                          <p className="text-xs text-[#9AA3B2]">{biz.city} · {biz.owner_email ?? "—"}</p>
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
                      <span className="font-bold text-[#1F2430]">{scans.toLocaleString("tr-TR")}</span>
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
    </main>
  );
}
