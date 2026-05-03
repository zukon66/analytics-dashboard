"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MrrTrendPoint, MrrPlanBreakdown } from "@/lib/queries";
import PlanDistributionChart from "./PlanDistributionChart";
import t from "@/lib/i18n";

interface Props {
  data: MrrTrendPoint[];
  currentMrr: number;
  breakdown: MrrPlanBreakdown[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-extrabold text-[var(--text-1)]">
        ₺{Number(payload[0].value).toLocaleString("tr-TR")}
      </p>
    </div>
  );
}

export default function MrrTrendChart({ data, currentMrr, breakdown }: Props) {
  const hasData = data.some((d) => d.revenue > 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="kok-card kok-card-hover rounded-3xl p-6 md:p-8">
      {/* Başlık + Anlık MRR */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            {t.growth.mrr.badge}
          </span>
          <h3 className="text-lg font-bold text-[var(--text-1)]">{t.growth.mrr.title}</h3>
          <p className="text-sm text-[var(--text-2)] mt-1">{t.growth.mrr.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-[var(--accent)]">
            ₺{currentMrr.toLocaleString("tr-TR")}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
            {t.growth.mrr.currentMrr}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.growth.mrr.currentMrrSub}</p>
        </div>
      </div>

      {/* Grafik */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--text-muted)] mb-2">bar_chart</span>
          <p className="text-sm text-[var(--text-muted)]">{t.growth.mrr.noData}</p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.10)" />
            <XAxis
              dataKey="month_label"
              tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => `₺${Number(v).toLocaleString("tr-TR")}`}
              domain={[0, Math.ceil(maxRevenue * 1.15)]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,124,251,0.08)" }} />
            <Bar
              dataKey="revenue"
              fill="#C4B5FD"
              radius={[10, 10, 2, 2]}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7C6CF6"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      )}

      {/* Plan Bazlı Dağılım */}
      <PlanDistributionChart breakdown={breakdown} />
    </div>
  );
}
