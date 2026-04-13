"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const PERIODS = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
];

type Props = {
  activePeriod: string;
  activeDate?: string;
};

export default function DateFilterBar({ activePeriod, activeDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const isCustomDate = !!activeDate;
  const today = new Date().toISOString().split("T")[0];

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) router.push(`${pathname}?date=${val}`);
  }

  function openPicker() {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.click();
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Period butonları */}
      <div className="flex bg-[#F6F6FB] border border-[#E9E9F2] rounded-full p-1 gap-1">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`${pathname}?period=${p.key}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              !isCustomDate && activePeriod === p.key
                ? "bg-[#7C6CF6] text-white shadow-sm"
                : "text-[#6B7280] hover:text-[#1F2430]"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Tarih seçici butonu */}
      <button
        type="button"
        onClick={openPicker}
        className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
          isCustomDate
            ? "bg-[#7C6CF6] border-[#7C6CF6] text-white"
            : "bg-[#F6F6FB] border-[#E9E9F2] text-[#6B7280] hover:border-[#7C6CF6] hover:text-[#7C6CF6]"
        }`}
      >
        <span className="material-symbols-outlined text-sm leading-none">
          calendar_today
        </span>
        <span>{isCustomDate ? activeDate : "Tarih Seç"}</span>
      </button>

      {/* Gizli input */}
      <input
        ref={inputRef}
        type="date"
        max={today}
        value={activeDate ?? ""}
        onChange={handleDateChange}
        className="sr-only"
      />
    </div>
  );
}
