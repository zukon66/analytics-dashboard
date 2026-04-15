"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import t from "@/lib/i18n";

const navItems = [
  { href: "/",           icon: "monitor_heart", label: t.nav.dashboard,    exact: true  },
  { href: "/businesses", icon: "store",          label: t.businesses.title, exact: false },
  { href: "/growth",     icon: "trending_up",    label: t.nav.growth,       exact: true  },
  { href: "/settings",   icon: "settings",       label: t.nav.settings,     exact: true  },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-[var(--text-2)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors text-sm font-semibold"
      aria-label="Tema değiştir"
    >
      <span className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
        <span>{isDark ? "Açık Tema" : "Koyu Tema"}</span>
      </span>
      <span className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isDark ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}>
        <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen w-64 fixed left-0 top-0 flex flex-col p-6 space-y-6 z-50
        transform transition-transform duration-300
        bg-[var(--bg-sidebar)] border-r border-[var(--border)]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold tracking-tighter text-[var(--text-1)]">
            {t.app.name}
          </span>
          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            {t.app.tagline}
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-1)] hover:bg-[var(--accent-bg)] transition-colors"
          aria-label="Menüyü kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg ${
                isActive
                  ? "bg-[var(--accent-bg)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text-2)] hover:bg-[var(--accent-bg)]/50 hover:text-[var(--accent)]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tema toggle */}
      <div className="border-t border-[var(--border)] pt-4">
        <ThemeToggle />
      </div>

      {/* Çıkış */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Çıkış Yap
        </button>
      </form>

      {/* Durum Kartı */}
      <div className="mt-auto bg-[var(--accent-bg)] p-5 rounded-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
          <span className="text-sm font-bold text-[var(--accent)]">Örnek Veri</span>
        </div>
        <p className="text-xs text-[var(--text-2)] leading-relaxed">
          Şu an demo verileri gösteriliyor. QR menü bağlandığında gerçek veriler yansıyacak.
        </p>
        <Link
          href="/businesses"
          className="bg-[var(--accent)] text-white py-2 px-4 rounded-full text-xs font-bold w-fit hover:opacity-90 transition-opacity"
        >
          İşletmeleri Gör
        </Link>
      </div>
    </aside>
  );
}
