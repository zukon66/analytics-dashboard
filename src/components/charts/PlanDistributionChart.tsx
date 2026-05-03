"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from "recharts";

// Recharts 3.x types don't expose activeIndex/activeShape on Pie — cast to use them
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InteractivePie = Pie as any;
import type { MrrPlanBreakdown } from "@/lib/queries";

interface Props {
  breakdown: MrrPlanBreakdown[];
}

const PLAN_COLORS: Record<string, string> = {
  enterprise: "#7C6CF6",
  pro:        "#60A5FA",
  starter:    "#34D399",
  trial:      "#9AA3B2",
};

const PLAN_LABELS: Record<string, string> = {
  enterprise: "Enterprise",
  pro:        "Pro",
  starter:    "Starter",
  trial:      "Deneme",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MrrPlanBreakdown }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {PLAN_LABELS[item.plan] ?? item.plan}
      </p>
      <p className="text-base font-extrabold text-[var(--text-1)]">
        ₺{Number(item.plan_mrr).toLocaleString("tr-TR")}
      </p>
      <p className="text-xs text-[var(--text-2)]">{item.business_count} işletme</p>
    </div>
  );
}

// Hover'da dışa doğru büyüyen aktif dilim
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveShape(props: any) {
  const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill = "" } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      opacity={0.95}
    />
  );
}

export default function PlanDistributionChart({ breakdown }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  if (!breakdown.length) return null;

  const chartData = breakdown.map((b) => ({
    ...b,
    name:  PLAN_LABELS[b.plan] ?? b.plan,
    value: Number(b.plan_mrr),
  }));

  return (
    <div className="mt-6 pt-5 border-t border-[var(--border)]">
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
        Plan Bazlı Dağılım
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/2" style={{ height: 200, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <InteractivePie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                strokeWidth={2}
                stroke="var(--bg-card)"
                isAnimationActive
                activeIndex={activeIndex}
                activeShape={ActiveShape}
                onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.plan}
                    fill={PLAN_COLORS[entry.plan] ?? "#9AA3B2"}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </InteractivePie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 min-w-[160px] w-full md:w-1/2">
          {breakdown.map((item, idx) => (
            <div
              key={item.plan}
              className="flex items-center justify-between gap-4 px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: activeIndex === idx
                  ? (PLAN_COLORS[item.plan] ?? "#9AA3B2") + "18"
                  : "transparent",
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PLAN_COLORS[item.plan] ?? "#9AA3B2" }}
                />
                <span className="text-xs font-bold text-[var(--text-1)]">
                  {PLAN_LABELS[item.plan] ?? item.plan}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#7C6CF6]">
                  ₺{Number(item.plan_mrr).toLocaleString("tr-TR")}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">
                  ({item.business_count})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
