// Pulse animasyonlu temel skeleton bloğu
// Tüm loading.tsx dosyaları bunu kullanır
import React from "react";

export function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} style={style} />
  );
}

export function SkeletonKPICard() {
  return (
    <div className="kok-card rounded-3xl p-6 flex items-center gap-4">
      <SkeletonBlock className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-7 w-24 rounded-lg" />
        <SkeletonBlock className="h-3 w-32 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-t border-[var(--border)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBlock className={`h-4 rounded ${i === 0 ? "w-36" : "w-20"}`} />
          {i === 0 && <SkeletonBlock className="h-3 w-20 rounded mt-1.5" />}
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChartBar() {
  const heights = [40, 70, 55, 90, 45, 80, 60, 35, 75, 50, 85, 40];
  return (
    <div className="flex items-end gap-2 h-[200px] w-full px-2">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse bg-white/10 rounded-t-lg"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAreaChart() {
  return (
    <div className="relative h-[180px] w-full overflow-hidden rounded-xl">
      <SkeletonBlock className="absolute inset-0" />
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 180" preserveAspectRatio="none">
        <path d="M0,140 C60,120 100,60 160,80 C220,100 260,40 320,50 C360,57 380,90 400,70 L400,180 L0,180 Z"
          fill="#7C6CF6" />
      </svg>
    </div>
  );
}
