"use client";

import { useState } from "react";
import t from "@/lib/i18n";

type ZoneData = { zone: string; scans: number };
interface Props { data: ZoneData[] }

const COLORS = ["#7C6CF6", "#60A5FA", "#A78BFA", "#34D399"];
const GAP = 2;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number
): string {
  const o1 = polar(cx, cy, outerR, startDeg);
  const o2 = polar(cx, cy, outerR, endDeg);
  const i1 = polar(cx, cy, innerR, endDeg);
  const i2 = polar(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

export default function ZoneChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.scans, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;
  const activePct =
    activeItem && total > 0 ? Math.round((activeItem.scans / total) * 100) : null;

  const SIZE = 200;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const INNER = 52;
  const OUTER = 82;
  const ACTIVE_INNER = 46;
  const ACTIVE_OUTER = 94;

  const slices = data.reduce<
    Array<{ zone: string; scans: number; start: number; end: number; index: number }>
  >((acc, item, i) => {
    const cursorPos = i === 0 ? 0 : acc[i - 1].end + GAP / 2;
    const sweep = total > 0 ? (item.scans / total) * (360 - GAP * data.length) : 0;
    const start = cursorPos + GAP / 2;
    const end = cursorPos + sweep + GAP / 2;
    return [...acc, { ...item, start, end, index: i }];
  }, []);

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-8">
      <div className="mb-6">
        <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          {t.dashboard.zone.badge}
        </span>
        <h3 className="text-lg font-bold text-[#1F2430]">{t.dashboard.zone.title}</h3>
        <p className="text-[#6B7280] text-sm mt-1">{t.dashboard.zone.subtitle}</p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible" }}
        >
          {slices.map((slice) => {
            const isActive = activeIndex === slice.index;
            const isDimmed = activeIndex !== null && !isActive;
            const innerR = isActive ? ACTIVE_INNER : INNER;
            const outerR = isActive ? ACTIVE_OUTER : OUTER;
            const color = COLORS[slice.index % COLORS.length];

            return (
              <path
                key={slice.zone}
                d={arcPath(CX, CY, innerR, outerR, slice.start, slice.end)}
                fill={color}
                opacity={isDimmed ? 0.18 : 1}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.18s ease",
                  filter: isActive
                    ? `drop-shadow(0 4px 12px ${color}55)`
                    : "none",
                }}
                onMouseEnter={() => setActiveIndex(slice.index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          {activeItem ? (
            <>
              <p className="text-2xl font-extrabold text-[#1F2430] leading-tight">
                {activePct}%
              </p>
              <p
                className="text-[11px] font-bold uppercase tracking-tight mt-0.5 max-w-[72px] text-center leading-tight"
                style={{ color: COLORS[activeIndex! % COLORS.length] }}
              >
                {activeItem.zone}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {activeItem.scans.toLocaleString("tr-TR")}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-[#7C6CF6]">
                {total.toLocaleString("tr-TR")}
              </p>
              <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
                Toplam
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5">
        {data.map((item, i) => (
          <button
            key={item.zone}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            className="flex items-center gap-1.5"
            style={{
              opacity: activeIndex === null || activeIndex === i ? 1 : 0.3,
              transition: "opacity 0.18s ease",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-[11px] font-semibold text-[#6B7280]">
              {item.zone}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 text-center">
        <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
          {t.dashboard.zone.total}
        </p>
      </div>
    </div>
  );
}
