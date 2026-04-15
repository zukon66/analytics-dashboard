import Link from "next/link";
import type { TrialExpiration } from "@/lib/queries";
import t from "@/lib/i18n";

interface Props {
  items: TrialExpiration[];
}

function urgencyClass(days: number): string {
  if (days <= 3)  return "bg-[#FEE2E2] text-[#991B1B]";
  if (days <= 7)  return "bg-[#FEF3C7] text-[#92400E]";
  return "bg-[#FEF9C3] text-[#854D0E]";
}

function urgencyLabel(days: number): string {
  if (days === 0) return t.growth.trial.today;
  return `${days} ${t.growth.trial.daysLeft}`;
}

export default function TrialExpirationList({ items }: Props) {
  return (
    <div className="h-full flex flex-col">
      {/* Başlık */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <span className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-2 inline-block">
          {t.growth.trial.badge}
        </span>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F59E0B] text-lg">hourglass_bottom</span>
          <h3 className="text-base font-bold text-[var(--text-1)]">{t.growth.trial.title}</h3>
        </div>
        <p className="text-xs text-[var(--text-2)] mt-0.5">{t.growth.trial.subtitle}</p>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-[var(--text-muted)] mb-2 block">check_circle</span>
            <p className="text-sm text-[var(--text-muted)]">{t.growth.trial.empty}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="px-6 py-3">{t.growth.trial.cols.name}</th>
                <th className="px-4 py-3">{t.growth.trial.cols.city}</th>
                <th className="px-4 py-3 hidden md:table-cell">{t.growth.trial.cols.email}</th>
                <th className="px-4 py-3 text-right">{t.growth.trial.cols.daysRemaining}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((biz) => (
                <tr
                  key={biz.id}
                  className="hover:bg-[var(--bg-page)] transition-colors border-t border-[var(--border)]"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--text-1)] text-sm">{biz.name}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-2)]">{biz.city}</td>
                  <td className="px-4 py-4 text-xs text-[var(--text-muted)] hidden md:table-cell">
                    {biz.owner_email ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${urgencyClass(biz.days_remaining)}`}>
                      {urgencyLabel(biz.days_remaining)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/businesses/${biz.id}`}
                      className="text-xs text-[#7C6CF6] font-semibold hover:underline"
                    >
                      İncele →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
