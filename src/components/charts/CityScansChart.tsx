"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

type CityData = { city: string; scans: number };

interface Props {
  data: CityData[];
}

const COLORS = [
  "#7C6CF6",
  "#60A5FA",
  "#A78BFA",
  "#34D399",
  "#F59E0B",
  "#C4B5FD",
  "#DBEAFE",
  "#D1D5DB",
];

export default function CityScansChart({ data }: Props) {
  return (
    <div className="kok-card kok-card-hover rounded-3xl p-6 md:p-8 flex flex-col justify-between">
      <div className="mb-6">
        <span className="kok-soft-button px-3 py-1 text-[var(--accent)] rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Coğrafi Analiz
        </span>
        <h3 className="text-lg font-bold text-[var(--text-1)]">Şehire Göre Tarama</h3>
        <p className="text-[var(--text-2)] text-sm mt-1">Son 7 gün</p>
      </div>

      <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barSize={14}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="city"
            tick={{ fontSize: 11, fill: "#B7BCD0", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Bar dataKey="scans" radius={[0, 10, 10, 0]} fill={COLORS[0]} isAnimationActive={false}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
