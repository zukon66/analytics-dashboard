import Link from "next/link";
import t from "@/lib/i18n";

interface Props {
  trialCount: number;
  newBizCount: number;
  activationRate: number;
}

export default function GrowthSummaryCard({ trialCount, newBizCount, activationRate }: Props) {
  return (
    <div className="kok-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden relative">
      <div className="absolute right-0 top-0 h-28 w-44 bg-[var(--glow-1)] blur-3xl" />
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="kok-icon-tile p-2.5 rounded-2xl">
          <span className="material-symbols-outlined text-white text-lg">trending_up</span>
        </div>
        <div>
          <p className="text-sm font-extrabold text-[var(--text-1)]">{t.growth.summaryCard.title}</p>
          <p className="text-[10px] text-[var(--text-2)]">MRR · Trial · Aktivasyon</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-xl font-extrabold text-[#F59E0B]">{trialCount}</p>
          <p className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-tighter">
            {t.growth.summaryCard.trialWarnings}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-[#7C6CF6]">{newBizCount}</p>
          <p className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-tighter">
            {t.growth.summaryCard.newSignups}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-[#059669]">%{activationRate}</p>
          <p className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-tighter">
            {t.growth.summaryCard.activationRate}
          </p>
        </div>
      </div>

      <Link
        href="/growth"
        className="kok-gradient-button text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-95 transition-opacity flex-shrink-0"
      >
        <span className="material-symbols-outlined text-sm">trending_up</span>
        {t.growth.summaryCard.viewAll}
      </Link>
    </div>
  );
}
