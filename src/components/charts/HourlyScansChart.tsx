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
    <div className="bg-[#FFFFFF] rounded-xl p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Saat Analizi
          </span>
          <h2 className="text-2xl font-bold text-[#1F2430]">Saatlik Taramalar</h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Gün boyunca QR kod tarama dağılımı
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-extrabold text-[#7C6CF6]">
            {data.reduce((s, d) => s + d.scans, 0).toLocaleString("tr-TR")}
          </p>
          <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
            Bugünkü Toplam Tarama
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
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
          <Bar dataKey="scans" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.scans === maxScans
                    ? "#7C6CF6"
                    : entry.scans > maxScans * 0.6
                    ? "#A78BFA"
                    : "#E9E9F2"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#7C6CF6]"></span> Zirve Saati
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#A78BFA]"></span> Yoğun Trafik
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
          <span className="w-3 h-3 rounded-full bg-[#E9E9F2]"></span> Normal
        </div>
      </div>
    </div>
  );
}
