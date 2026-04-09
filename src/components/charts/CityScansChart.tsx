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
    <div className="bg-[#F6F6FB] rounded-xl p-8 flex flex-col justify-between">
      <div className="mb-6">
        <span className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Coğrafi Analiz
        </span>
        <h3 className="text-lg font-bold text-[#1F2430]">Şehire Göre Tarama</h3>
        <p className="text-[#6B7280] text-sm mt-1">Son 7 gün</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barSize={14}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="city"
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E9E9F2",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(124,108,246,0.08)",
              fontSize: 12,
            }}
            cursor={{ fill: "#EEEAFE" }}
          />
          <Bar dataKey="scans" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
