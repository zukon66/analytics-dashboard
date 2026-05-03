"use client";

import { useEffect, useState } from "react";
import t from "@/lib/i18n";

const STORAGE_KEY = "kok_settings";
const DEFAULTS = { restaurantName: "KÖK Restoran", userName: "Restoran Sahibi" };

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [{ restaurantName, userName }, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const s = JSON.parse(stored);
        setSettings({
          restaurantName: s.restaurantName ?? DEFAULTS.restaurantName,
          userName: s.name ?? DEFAULTS.userName,
        });
      } catch {}
    });
  }, []);

  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40
      bg-[rgba(8,9,15,0.72)] backdrop-blur-2xl
      flex justify-between items-center px-4 md:px-8 h-16
      border-b border-[var(--border)]">

      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-1)] hover:bg-[var(--accent-bg)] transition-colors"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <span className="kok-icon-tile h-8 w-8 rounded-xl hidden md:flex items-center justify-center">
          <span className="material-symbols-outlined text-[var(--accent)] text-lg">monitor_heart</span>
        </span>
        <span className="text-sm font-black text-[var(--text-1)]">
          KÖK-OS{" "}
          <span className="text-[var(--text-muted)] font-semibold text-xs">Operator Panel</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l pl-6 border-[var(--border)]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[var(--text-1)]">{userName}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {restaurantName} · {t.topNav.userRole}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full kok-gradient-button flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
