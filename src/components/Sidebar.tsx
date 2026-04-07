"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import t from "@/lib/i18n";

const navItems = [
  { href: "/", icon: "dashboard", label: t.nav.dashboard },
  { href: "/analytics", icon: "analytics", label: t.nav.analytics },
  { href: "/orders", icon: "receipt_long", label: t.nav.orders },
  { href: "/customers", icon: "group", label: t.nav.customers },
  { href: "/settings", icon: "settings", label: t.nav.settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f2f4f5] flex flex-col p-6 space-y-8 z-50">
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold tracking-tighter text-[#2e3335]">
          {t.app.name}
        </span>
        <span className="text-xs uppercase tracking-widest text-[#5a6062] font-semibold">
          {t.app.tagline}
        </span>
      </div>

      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg ${
                isActive
                  ? "bg-[#aef764]/50 text-[#3c6b00] font-semibold"
                  : "text-[#5a6062] hover:bg-slate-200/50"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto bg-[#aef764] p-5 rounded-xl flex flex-col gap-3">
        <span className="text-sm font-bold text-[#335c00]">{t.upgrade.title}</span>
        <p className="text-xs text-[#335c00]/80">{t.upgrade.description}</p>
        <button className="bg-[#3c6b00] text-[#eeffd6] py-2 px-4 rounded-full text-xs font-bold w-fit">
          {t.upgrade.button}
        </button>
      </div>
    </aside>
  );
}
