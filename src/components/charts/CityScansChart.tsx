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
  "#3c6b00",
  "#aef764",
  "#a1d1fe",
  "#ebdcff",
  "#a0e857",
  "#93c3ef",
  "#dfccfe",
  "#e5e9eb",
];

export default function CityScansChart({ data }: Props) {
  return (
    <div className="bg-[#f2f4f5] rounded-xl p-8 flex flex-col justify-between">
      <div className="mb-6">
        <span className="px-3 py-1 bg-[#a1d1fe] text-[#0a476d] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Geo Analysis
        </span>
        <h3 className="text-lg font-bold text-[#2e3335]">Scans by City</h3>
        <p className="text-[#5a6062] text-sm mt-1">Last 7 days</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barSize={14}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="city"
            tick={{ fontSize: 11, fill: "#5a6062", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(46,51,53,0.08)",
              fontSize: 12,
            }}
            cursor={{ fill: "#ebeef0" }}
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
