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
import t from "@/lib/i18n";

interface Props {
  data: MrrTrendPoint[];
  currentMrr: number;
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

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E9E9F2] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] font-bold text-[#9AA3B2] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-extrabold text-[#1F2430]">
        ₺{Number(payload[0].value).toLocaleString("tr-TR")}
      </p>
    </div>
  );
}

export default function MrrTrendChart({ data, currentMrr, breakdown }: Props) {
  const hasData = data.some((d) => d.revenue > 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-[#E9E9F2] p-8">
      {/* Başlık + Anlık MRR */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            {t.growth.mrr.badge}
          </span>
          <h3 className="text-lg font-bold text-[#1F2430]">{t.growth.mrr.title}</h3>
          <p className="text-sm text-[#6B7280] mt-1">{t.growth.mrr.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-[#7C6CF6]">
            ₺{currentMrr.toLocaleString("tr-TR")}
          </p>
          <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
            {t.growth.mrr.currentMrr}
          </p>
          <p className="text-[10px] text-[#9AA3B2] mt-0.5">{t.growth.mrr.currentMrrSub}</p>
        </div>
      </div>

      {/* Grafik */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <span className="material-symbols-outlined text-4xl text-[#9AA3B2] mb-2">bar_chart</span>
          <p className="text-sm text-[#9AA3B2]">{t.growth.mrr.noData}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F6F6FB" }} />
            <Bar
              dataKey="revenue"
              fill="#C4B5FD"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7C6CF6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Plan Bazlı Dağılım */}
      {breakdown.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#E9E9F2]">
          <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-widest mb-3">
            {t.growth.mrr.planBreakdown}
          </p>
          <div className="flex flex-wrap gap-3">
            {breakdown.map((item) => (
              <div
                key={item.plan}
                className="flex items-center gap-2 bg-[#FAFAFD] rounded-lg px-3 py-2 border border-[#E9E9F2]"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PLAN_COLORS[item.plan] ?? "#9AA3B2" }}
                />
                <span className="text-xs font-bold text-[#1F2430]">
                  {PLAN_LABELS[item.plan] ?? item.plan}
                </span>
                <span className="text-xs text-[#9AA3B2]">
                  {item.business_count} işletme
                </span>
                <span className="text-xs font-bold text-[#7C6CF6]">
                  ₺{Number(item.plan_mrr).toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
