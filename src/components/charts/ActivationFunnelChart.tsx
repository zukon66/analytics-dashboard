"use client";

import { useState } from "react";
import type { ActivationFunnel } from "@/lib/queries";
import t from "@/lib/i18n";

interface Props {
  funnel: ActivationFunnel;
}

const STAGES = [
  {
    key: "registered",
    icon: "store",
    color: "#7C6CF6",
    bg: "#EEEAFE",
    getText: (f: ActivationFunnel) => t.growth.funnel.stages.registered,
    getCount: (f: ActivationFunnel) => f.totalBusinesses,
    getPct: () => 100,
  },
  {
    key: "activated",
    icon: "qr_code_scanner",
    color: "#3B82F6",
    bg: "#DBEAFE",
    getText: (f: ActivationFunnel) => t.growth.funnel.stages.activated,
    getCount: (f: ActivationFunnel) => f.activated1Plus,
    getPct: (f: ActivationFunnel) =>
      f.totalBusinesses > 0
        ? Math.round((f.activated1Plus / f.totalBusinesses) * 100)
        : 0,
  },
  {
    key: "powerUser",
    icon: "bolt",
    color: "#059669",
    bg: "#DCFCE7",
    getText: (f: ActivationFunnel) => t.growth.funnel.stages.powerUser,
    getCount: (f: ActivationFunnel) => f.powerUsers10Plus,
    getPct: (f: ActivationFunnel) =>
      f.totalBusinesses > 0
        ? Math.round((f.powerUsers10Plus / f.totalBusinesses) * 100)
        : 0,
  },
] as const;

export default function ActivationFunnelChart({ funnel }: Props) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Başlık */}
      <div className="mb-5">
        <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C6CF6] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-2 inline-block">
          {t.growth.funnel.badge}
        </span>
        <h3 className="text-base font-bold text-[var(--text-1)]">{t.growth.funnel.title}</h3>
        <p className="text-xs text-[var(--text-2)] mt-0.5">{t.growth.funnel.subtitle}</p>
      </div>

      {/* Huni Barları */}
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {STAGES.map((stage, idx) => {
          const count = stage.getCount(funnel);
          const pct = stage.getPct(funnel as ActivationFunnel);
          const isHovered = hoveredStage === stage.key;
          const barWidth = `${Math.max(pct, 8)}%`;

          return (
            <div key={stage.key}>
              <div
                className="relative cursor-default"
                onMouseEnter={() => setHoveredStage(stage.key)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Bar container */}
                <div className="bg-[var(--bg-page)] rounded-xl h-14 overflow-hidden relative">
                  {/* Dolu kısım */}
                  <div
                    className="h-full rounded-xl transition-all duration-300 flex items-center px-4"
                    style={{
                      width: barWidth,
                      backgroundColor: isHovered ? stage.color : stage.bg,
                      minWidth: "80px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-base flex-shrink-0"
                      style={{ color: isHovered ? "white" : stage.color }}
                    >
                      {stage.icon}
                    </span>
                  </div>

                  {/* Etiket + sayı (bar üzerine overlay) */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <span
                      className="text-xs font-bold truncate ml-8"
                      style={{ color: isHovered ? "white" : "#1F2430" }}
                    >
                      {stage.getText(funnel)}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-base font-extrabold"
                        style={{ color: isHovered ? "white" : stage.color }}
                      >
                        {count.toLocaleString("tr-TR")}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isHovered ? "rgba(255,255,255,0.25)" : stage.bg,
                          color: isHovered ? "white" : stage.color,
                        }}
                      >
                        %{pct}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ok bağlayıcı */}
              {idx < STAGES.length - 1 && (
                <div className="flex justify-center my-1">
                  <span className="material-symbols-outlined text-base text-[#D1D5DB]">
                    arrow_downward
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alt özet */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#3B82F6]">
            %{funnel.totalBusinesses > 0
              ? Math.round((funnel.activated1Plus / funnel.totalBusinesses) * 100)
              : 0}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
            Aktivasyon Oranı
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#059669]">
            %{funnel.totalBusinesses > 0
              ? Math.round((funnel.powerUsers10Plus / funnel.totalBusinesses) * 100)
              : 0}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
            Güçlü Kullanıcı
          </p>
        </div>
      </div>
    </div>
  );
}
