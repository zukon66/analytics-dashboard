"use client";

import { useState, useEffect } from "react";
import t from "@/lib/i18n";

const STORAGE_KEY = "kok_settings";
const DEFAULTS = { restaurantName: "KÖK Restoran", userName: "Restoran Sahibi" };

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [{ restaurantName, userName }, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const s = JSON.parse(stored);
        setSettings({
          restaurantName: s.restaurantName ?? DEFAULTS.restaurantName,
          userName: s.name ?? DEFAULTS.userName,
        });
      }
    } catch {}
  }, []);
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-16 border-b border-[#E9E9F2]">
      <div className="flex items-center gap-3">
        {/* Mobil hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-[#9AA3B2] hover:text-[#1F2430] hover:bg-[#F6F6FB] transition-colors"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <span className="material-symbols-outlined text-[#9AA3B2] text-lg hidden md:block">store</span>
        <span className="text-sm font-bold text-[#1F2430]">{restaurantName}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l pl-6 border-[#E9E9F2]">
          <div className="text-right">
            <p className="text-xs font-bold text-[#1F2430]">{userName}</p>
            <p className="text-[10px] text-[#9AA3B2]">{t.topNav.userRole}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EEEAFE] flex items-center justify-center text-[#7C6CF6] font-bold text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
