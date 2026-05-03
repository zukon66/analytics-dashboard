"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const MOCK_START = "2026-05-02";
const MOCK_END = "2026-05-31";

const PERIODS = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
];

const TEST_DATES = Array.from({ length: 30 }, (_, index) => {
  const day = index + 2;
  const date = `2026-05-${String(day).padStart(2, "0")}`;
  const label = new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", {
    weekday: "short",
  });
  return { date, day, label };
});

type Props = {
  activePeriod: string;
  activeDate?: string;
};

export default function DateFilterBar({ activePeriod, activeDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isCustomDate = !!activeDate;

  const currentIdx = activeDate ? TEST_DATES.findIndex((d) => d.date === activeDate) : -1;
  const prevDate = currentIdx > 0 ? TEST_DATES[currentIdx - 1].date : null;
  const nextDate = currentIdx >= 0 && currentIdx < TEST_DATES.length - 1 ? TEST_DATES[currentIdx + 1].date : null;

  // Seçili tarihi görünür alana kaydır
  useEffect(() => {
    if (currentIdx < 0 || !scrollRef.current) return;
    const tile = scrollRef.current.children[currentIdx] as HTMLElement;
    if (tile) {
      tile.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIdx]);

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
    <section className="kok-card w-full min-w-0 rounded-3xl p-3 md:p-4 kok-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-black/25 border border-[var(--border)] rounded-full p-1 gap-1">
            {PERIODS.map((p) => (
              <Link
                key={p.key}
                href={`${pathname}?period=${p.key}`}
                scroll={false}
                prefetch={false}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  !isCustomDate && activePeriod === p.key
                    ? "kok-gradient-button text-white"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={openPicker}
            className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              isCustomDate
                ? "kok-gradient-button border-[#7C6CF6] text-white"
                : "bg-black/25 border-[var(--border)] text-[var(--text-2)] hover:border-[#7C6CF6] hover:text-[#7C6CF6]"
            }`}
          >
            <span className="material-symbols-outlined text-sm leading-none">calendar_today</span>
            <span>{isCustomDate ? activeDate : "Tarih seç"}</span>
          </button>

          <input
            ref={inputRef}
            type="date"
            min={MOCK_START}
            max={MOCK_END}
            value={activeDate ?? ""}
            onChange={handleDateChange}
            className="sr-only"
          />
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Mayıs 2026 test takvimi
        </div>
      </div>

      {/* Tarih listesi + oklar */}
      <div className="mt-3 flex items-center gap-2">
        {/* Geri oku */}
        {prevDate ? (
          <Link
            href={`${pathname}?date=${prevDate}`}
            scroll={false}
            prefetch={false}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-[var(--text-muted)] hover:border-[#7C6CF6]/60 hover:text-white transition-all"
            aria-label="Önceki gün"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </Link>
        ) : (
          <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/5 text-[var(--text-muted)]/30">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </div>
        )}

        {/* Kaydırılabilir tarih listesi */}
        <div className="flex-1 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          <div ref={scrollRef} className="flex min-w-max gap-2">
            {TEST_DATES.map((item) => {
              const selected = activeDate === item.date;
              return (
                <Link
                  key={item.date}
                  href={`${pathname}?date=${item.date}`}
                  scroll={false}
                  prefetch={false}
                  className={`group flex h-16 w-14 flex-col items-center justify-center rounded-2xl border text-center transition-all ${
                    selected
                      ? "border-[#8E7CFF] bg-[#7C6CF6]/20 text-white shadow-[0_0_28px_rgba(124,108,246,0.32)]"
                      : "border-white/10 bg-white/[0.035] text-[var(--text-2)] hover:border-[#7C6CF6]/60 hover:bg-[#7C6CF6]/10 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] group-hover:text-[#C9C2FF]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-lg font-black leading-none">{item.day}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* İleri oku */}
        {nextDate ? (
          <Link
            href={`${pathname}?date=${nextDate}`}
            scroll={false}
            prefetch={false}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-[var(--text-muted)] hover:border-[#7C6CF6]/60 hover:text-white transition-all"
            aria-label="Sonraki gün"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </Link>
        ) : (
          <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/5 text-[var(--text-muted)]/30">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </div>
        )}
      </div>
    </section>
  );
}
