import Link from "next/link";
import type { NewRegistration, TrialExpiration, Business } from "@/lib/queries";

type ActivityEvent =
  | { type: "new_reg"; biz: NewRegistration }
  | { type: "trial_warn"; biz: TrialExpiration }
  | { type: "churn_risk"; biz: Business & { daysSinceActive: number } };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (mins > 0) return `${mins} dk önce`;
  return "Az önce";
}

const EVENT_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  new_reg:    { icon: "storefront",      bg: "bg-[#DCFCE7]", color: "text-[#15803D]" },
  trial_warn: { icon: "timer",           bg: "bg-[#FEF3C7]", color: "text-[#92400E]" },
  churn_risk: { icon: "warning",         bg: "bg-[#FEE2E2]", color: "text-[#991B1B]" },
};

function buildEvents(
  newRegs: NewRegistration[],
  trials: TrialExpiration[],
  churnList: Array<Business & { daysSinceActive: number }>
): ActivityEvent[] {
  const events: ActivityEvent[] = [
    ...newRegs.slice(0, 5).map((biz) => ({ type: "new_reg" as const, biz })),
    ...trials.slice(0, 4).map((biz) => ({ type: "trial_warn" as const, biz })),
    ...churnList.slice(0, 3).map((biz) => ({ type: "churn_risk" as const, biz })),
  ];

  // Tarihe göre sırala (en yeni önce)
  events.sort((a, b) => {
    const dateA =
      a.type === "new_reg"
        ? a.biz.created_at
        : a.type === "trial_warn"
        ? a.biz.trial_ends_at
        : a.biz.last_active_at ?? "";
    const dateB =
      b.type === "new_reg"
        ? b.biz.created_at
        : b.type === "trial_warn"
        ? b.biz.trial_ends_at
        : b.biz.last_active_at ?? "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return events.slice(0, 10);
}

function EventRow({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_ICONS[event.type];

  if (event.type === "new_reg") {
    const biz = event.biz;
    return (
      <div className="flex items-start gap-3 py-3 px-4 hover:bg-white/[0.035] transition-colors">
        <div className={`mt-0.5 p-2 rounded-lg ${cfg.bg} ${cfg.color} shrink-0`}>
          <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-1)] truncate">
            Yeni Kayıt: <span className="text-[#7C6CF6]">{biz.name}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)]">{biz.city} · {biz.plan} planı</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(biz.created_at)}</span>
          <Link href={`/businesses/${biz.id}`} className="text-[10px] text-[#7C6CF6] font-semibold hover:underline">
            İncele →
          </Link>
        </div>
      </div>
    );
  }

  if (event.type === "trial_warn") {
    const biz = event.biz;
    return (
      <div className="flex items-start gap-3 py-3 px-4 hover:bg-white/[0.035] transition-colors">
        <div className={`mt-0.5 p-2 rounded-lg ${cfg.bg} ${cfg.color} shrink-0`}>
          <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-1)] truncate">
            Trial Bitiyor: <span className="text-[#92400E]">{biz.name}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)]">{biz.city} · {biz.days_remaining} gün kaldı</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              biz.days_remaining <= 3 ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#FEF3C7] text-[#92400E]"
            }`}
          >
            {biz.days_remaining}g
          </span>
          <Link href={`/businesses/${biz.id}`} className="text-[10px] text-[#7C6CF6] font-semibold hover:underline">
            İncele →
          </Link>
        </div>
      </div>
    );
  }

  // churn_risk
  const biz = event.biz;
  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-white/[0.035] transition-colors">
      <div className={`mt-0.5 p-2 rounded-lg ${cfg.bg} ${cfg.color} shrink-0`}>
        <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] truncate">
          Churn Riski: <span className="text-[#991B1B]">{biz.name}</span>
        </p>
        <p className="text-xs text-[var(--text-muted)]">{biz.city} · {biz.daysSinceActive} gündür pasif</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(biz.last_active_at ?? "")}</span>
        <Link href={`/businesses/${biz.id}`} className="text-[10px] text-[#7C6CF6] font-semibold hover:underline">
          İncele →
        </Link>
      </div>
    </div>
  );
}

export default function ActivityLog({
  newRegs,
  trials,
  churnList,
}: {
  newRegs: NewRegistration[];
  trials: TrialExpiration[];
  churnList: Array<Business & { daysSinceActive: number }>;
}) {
  const events = buildEvents(newRegs, trials, churnList);

  return (
    <div className="kok-card rounded-3xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-3">
        <span className="material-symbols-outlined text-[#7C6CF6]">history</span>
        <div>
          <h3 className="text-base font-bold text-[var(--text-1)]">Aktivite Günlüğü</h3>
          <p className="text-xs text-[var(--text-muted)]">Son platformda gerçekleşen önemli olaylar</p>
        </div>
        <span className="ml-auto bg-[#EEEAFE] text-[#7C6CF6] text-[10px] font-bold px-2 py-0.5 rounded-full">
          {events.length} olay
        </span>
      </div>
      {events.length === 0 ? (
        <div className="kok-empty py-12 text-center text-sm text-[var(--text-muted)]">
          <span className="material-symbols-outlined kok-pulse-soft text-3xl mb-2 block text-[var(--accent)]">check_circle</span>
          Henüz kayda değer bir olay yok
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {events.map((event, i) => (
            <EventRow key={i} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
