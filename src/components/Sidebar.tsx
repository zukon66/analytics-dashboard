"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  const isDark = theme !== "light";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl text-[var(--text-2)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-1)] transition-colors text-sm font-semibold"
      aria-label="Tema değiştir"
    >
      <span className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
        <span>{isDark ? "Açık Tema" : "Koyu Tema"}</span>
      </span>
      <span className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isDark ? "kok-gradient-button" : "bg-[var(--border)]"}`}>
        <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen w-64 fixed left-0 top-0 flex flex-col p-5 space-y-5 z-50
        transform transition-transform duration-300
        bg-[var(--bg-sidebar)]/95 border-r border-[var(--border)] backdrop-blur-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="kok-icon-tile h-11 w-11 rounded-2xl flex items-center justify-center text-[var(--accent)]">
            <span className="material-symbols-outlined text-xl">hexagon</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-black tracking-tight text-[var(--text-1)]">
              {t.app.name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] font-bold">
              {t.app.tagline}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-1)] hover:bg-[var(--accent-bg)] transition-colors"
          aria-label="Menüyü kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col space-y-1.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-4 py-3 transition-all rounded-2xl border ${
                isActive
                  ? "bg-[var(--accent-bg)] text-[var(--text-1)] font-semibold border-[rgba(139,124,251,0.35)] shadow-[0_12px_34px_rgba(139,124,251,0.14)]"
                  : "text-[var(--text-2)] border-transparent hover:bg-[var(--accent-bg)]/50 hover:text-[var(--text-1)] hover:border-[rgba(139,124,251,0.18)]"
              }`}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] group-hover:text-[var(--accent)]"}`}
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
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Çıkış Yap
        </button>
      </form>

      {/* Durum Kartı */}
      <div className="kok-card mt-auto p-5 rounded-3xl flex flex-col gap-3 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--glow-1)] blur-2xl" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--warning)] shadow-[0_0_18px_rgba(245,158,11,0.65)]"></span>
          <span className="text-sm font-bold text-[var(--text-1)]">Örnek Veri</span>
        </div>
        <p className="text-xs text-[var(--text-2)] leading-relaxed">
          Şu an demo verileri gösteriliyor. QR menü bağlandığında gerçek veriler yansıyacak.
        </p>
        <Link
          href="/businesses"
          className="kok-gradient-button text-white py-2 px-4 rounded-full text-xs font-bold w-fit hover:opacity-90 transition-opacity"
        >
          İşletmeleri Gör
        </Link>
      </div>
    </aside>
  );
}
