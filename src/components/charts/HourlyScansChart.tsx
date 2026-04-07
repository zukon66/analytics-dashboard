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

interface Props {
  data: HourlyData[];
}

export default function HourlyScansChart({ data }: Props) {
  const maxScans = Math.max(...data.map((d) => d.scans), 1);

  return (
    <div className="bg-[#ffffff] rounded-xl p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="px-3 py-1 bg-[#ebdcff] text-[#594a74] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Time Analysis
          </span>
          <h2 className="text-2xl font-bold text-[#2e3335]">Hourly Scans</h2>
          <p className="text-[#5a6062] text-sm mt-1">
            QR scan distribution throughout the day
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-extrabold text-[#3c6b00]">
            {data.reduce((s, d) => s + d.scans, 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
            Total Scans Today
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={18}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#5a6062", fontWeight: 700 }}
            tickFormatter={(v: string) => v.slice(0, 5)}
            interval={2}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
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
          <Bar dataKey="scans" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.scans === maxScans
                    ? "#3c6b00"
                    : entry.scans > maxScans * 0.6
                    ? "#aef764"
                    : "#e5e9eb"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6062]">
          <span className="w-3 h-3 rounded-full bg-[#3c6b00]"></span> Peak Hour
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6062]">
          <span className="w-3 h-3 rounded-full bg-[#aef764]"></span> High
          Traffic
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6062]">
          <span className="w-3 h-3 rounded-full bg-[#e5e9eb]"></span> Normal
        </div>
      </div>
    </div>
  );
}
