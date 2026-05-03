"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PERIODS = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
];

const DAY_MS = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Props = {
  activePeriod: string;
  activeDate?: string;
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey?: string): Date {
  if (dateKey && DATE_RE.test(dateKey)) {
    return new Date(`${dateKey}T12:00:00`);
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
}

function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function buildDateWindow(centerDateKey?: string) {
  const center = parseDateKey(centerDateKey);
  return Array.from({ length: 31 }, (_, index) => {
    const date = new Date(center.getTime() + (index - 15) * DAY_MS);
    return {
      date: toDateKey(date),
      day: date.getDate(),
      label: date.toLocaleDateString("tr-TR", { weekday: "short" }),
      month: date.toLocaleDateString("tr-TR", { month: "short" }),
    };
  });
}

export default function DateFilterBar({ activePeriod, activeDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isCustomDate = !!activeDate;
  const currentDate = activeDate ?? toDateKey(parseDateKey());
  const visibleDates = buildDateWindow(currentDate);
  const currentIdx = visibleDates.findIndex((d) => d.date === currentDate);
  const prevDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);

  useEffect(() => {
    if (currentIdx < 0 || !scrollRef.current) return;
    const tile = scrollRef.current.children[currentIdx] as HTMLElement;
    tile?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
            value={activeDate ?? ""}
            onChange={handleDateChange}
            className="sr-only"
          />
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Serbest tarih seçimi
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`${pathname}?date=${prevDate}`}
          scroll={false}
          prefetch={false}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-[var(--text-muted)] hover:border-[#7C6CF6]/60 hover:text-white transition-all"
          aria-label="Önceki gün"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </Link>

        <div className="flex-1 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          <div ref={scrollRef} className="flex min-w-max gap-2">
            {visibleDates.map((item) => {
              const selected = activeDate === item.date;
              return (
                <Link
                  key={item.date}
                  href={`${pathname}?date=${item.date}`}
                  scroll={false}
                  prefetch={false}
                  className={`group flex h-[72px] w-14 flex-col items-center justify-center rounded-2xl border text-center transition-all ${
                    selected
                      ? "border-[#8E7CFF] bg-[#7C6CF6]/20 text-white shadow-[0_0_28px_rgba(124,108,246,0.32)]"
                      : "border-white/10 bg-white/[0.035] text-[var(--text-2)] hover:border-[#7C6CF6]/60 hover:bg-[#7C6CF6]/10 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] group-hover:text-[#C9C2FF]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-lg font-black leading-none">{item.day}</span>
                  <span className="mt-0.5 text-[9px] font-bold uppercase text-[var(--text-muted)]">
                    {item.month}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          href={`${pathname}?date=${nextDate}`}
          scroll={false}
          prefetch={false}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-[var(--text-muted)] hover:border-[#7C6CF6]/60 hover:text-white transition-all"
          aria-label="Sonraki gün"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </Link>
      </div>
    </section>
  );
}
