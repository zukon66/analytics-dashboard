"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CustomerGrowthPoint } from "@/lib/queries";

interface Props {
  data:        CustomerGrowthPoint[];
  granularity: "weekly" | "monthly";
}

export default function CustomerGrowthChart({ data, granularity }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  function toggle(g: "weekly" | "monthly") {
    router.push(`${pathname}?trend=${g}`);
  }

  const hasData = data.some((d) => d.newCustomers > 0);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 mb-8">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <span className="px-3 py-1 bg-[#EDE9FE] text-[#6D28D9] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Büyüme Trendi
          </span>
          <h3 className="text-lg font-bold text-[var(--text-1)]">Müşteri Büyüme Trendi</h3>
          <p className="text-sm text-[var(--text-2)] mt-1">
            {granularity === "weekly" ? "Son 8 hafta" : "Son 6 ay"}
          </p>
        </div>

        <div className="flex bg-[#F6F6FB] border border-[#E9E9F2] rounded-full p-1 gap-1">
          {(["weekly", "monthly"] as const).map((g) => (
            <button
              key={g}
              onClick={() => toggle(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                granularity === g
                  ? "bg-[#7C6CF6] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2430]"
              }`}
            >
              {g === "weekly" ? "Haftalık" : "Aylık"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <span className="material-symbols-outlined text-4xl text-[#9AA3B2] mb-2">
            trending_up
          </span>
          <p className="text-sm text-[#9AA3B2]">Henüz müşteri trendi verisi yok.</p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C6CF6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7C6CF6" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9AA3B2", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E9E9F2",
                borderRadius: "12px",
                fontSize: 12,
              }}
              cursor={{ stroke: "#7C6CF6", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="newCustomers"
              name="Müşteri Aktivitesi"
              stroke="#7C6CF6"
              strokeWidth={2}
              fill="url(#customerGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
