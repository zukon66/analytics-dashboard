import Link from "next/link";
import t from "@/lib/i18n";

interface Props {
  trialCount: number;
  newBizCount: number;
  activationRate: number;
}

export default function GrowthSummaryCard({ trialCount, newBizCount, activationRate }: Props) {
  return (
    <div className="bg-[var(--accent-bg)] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="p-2.5 bg-[#7C6CF6] rounded-xl">
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
        className="bg-[#7C6CF6] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#6D5DF0] transition-colors flex-shrink-0"
      >
        <span className="material-symbols-outlined text-sm">trending_up</span>
        {t.growth.summaryCard.viewAll}
      </Link>
    </div>
  );
}
