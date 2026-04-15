"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type HourlyData = { hour: string; scans: number };

const PERIOD_DAYS: Record<string, number> = { today: 1, "7d": 7, "30d": 30 };
const PERIOD_LABEL: Record<string, string> = {
  today: "Bugünkü Toplam",
  "7d":  "7 Günlük Toplam",
  "30d": "30 Günlük Toplam",
};
const PERIOD_SUB: Record<string, string> = {
  today: "Gün boyunca QR kod tarama dağılımı",
  "7d":  "Son 7 günün saatlik dağılımı",
  "30d": "Son 30 günün saatlik dağılımı",
};

interface Props {
  data: HourlyData[];
  period?: string;
}

export default function HourlyScansChart({ data, period = "today" }: Props) {
  const maxScans = Math.max(...data.map((d) => d.scans), 1);
  const total = data.reduce((s, d) => s + d.scans, 0);
  const days = PERIOD_DAYS[period] ?? 1;
  const avgPerDay = days > 1 ? Math.round(total / days) : null;

  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border)]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Saat Analizi
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-1)]">Saatlik Taramalar</h2>
          <p className="text-[var(--text-2)] text-sm mt-1">
            {PERIOD_SUB[period] ?? "Gün boyunca QR kod tarama dağılımı"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-extrabold text-[#7C6CF6]">
            {total.toLocaleString("tr-TR")}
          </p>
          <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
            {PERIOD_LABEL[period] ?? "Toplam Tarama"}
          </p>
          {avgPerDay !== null && (
            <p className="text-xs text-[#9AA3B2] mt-0.5">
              ≈ {avgPerDay.toLocaleString("tr-TR")} / gün ortalama
            </p>
          )}
        </div>
      </div>

      <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={18}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 700 }}
            tickFormatter={(v: string) => v.slice(0, 5)}
            interval={2}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E9E9F2",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(124,108,246,0.08)",
              fontSize: 12,
            }}
            cursor={{ fill: "#F6F6FB" }}
          />
          <Bar dataKey="scans" radius={[4, 4, 0, 0]} fill="#C4B5FD" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.scans === maxScans && entry.scans > 0
                    ? "#7C6CF6"
                    : entry.scans > maxScans * 0.6
                    ? "#A78BFA"
                    : "#C4B5FD"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#7C6CF6]"></span> Zirve Saati
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#A78BFA]"></span> Yoğun Trafik
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#C4B5FD]"></span> Normal
        </div>
      </div>
    </div>
  );
}
