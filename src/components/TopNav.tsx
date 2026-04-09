"use client";

import { useEffect, useState } from "react";
import t from "@/lib/i18n";

const STORAGE_KEY = "kok_settings";

export default function TopNav() {
  const [restaurantName, setRestaurantName] = useState("KÖK Restoran");
  const [userName, setUserName] = useState("Restoran Sahibi");
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const s = JSON.parse(stored);
        if (s.restaurantName) setRestaurantName(s.restaurantName);
        if (s.name) setUserName(s.name);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-[#E9E9F2]">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#9AA3B2] text-lg">store</span>
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
