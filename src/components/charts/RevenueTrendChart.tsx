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
import type { RevenueDayPoint } from "@/lib/queries";

interface Props {
  data: RevenueDayPoint[];
  title?: string;
  subtitle?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
  const orders = payload.find((p) => p.dataKey === "orders")?.value ?? 0;
  const dateLabel = label
    ? new Date(label + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : label;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{dateLabel}</p>
      <p className="text-base font-extrabold text-[var(--text-1)]">
        ₺{Number(revenue).toLocaleString("tr-TR")}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{orders} sipariş</p>
    </div>
  );
}

export default function RevenueTrendChart({ data, title = "Günlük Ciro", subtitle = "Son 14 günün ciro trendi" }: Props) {
  const hasData = data.some((d) => d.revenue > 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="kok-card rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-1)]">{title}</h3>
          <p className="text-sm text-[var(--text-2)] mt-1">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[var(--accent)]">
            ₺{data.reduce((s, d) => s + d.revenue, 0).toLocaleString("tr-TR")}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
            Dönem toplam
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--text-muted)] mb-2">bar_chart</span>
          <p className="text-sm text-[var(--text-muted)]">Bu dönem henüz sipariş yok</p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formatted} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(v) => `₺${Number(v / 1000).toFixed(0)}k`}
                domain={[0, Math.ceil(maxRevenue * 1.2)]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,124,251,0.07)" }} />
              <Bar dataKey="revenue" fill="rgba(124,108,246,0.35)" radius={[6, 6, 2, 2]} isAnimationActive />
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
    </div>
  );
}
