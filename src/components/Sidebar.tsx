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

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen w-64 fixed left-0 top-0 bg-[#F6F6FB] flex flex-col p-6 space-y-8 z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold tracking-tighter text-[#1F2430]">
            {t.app.name}
          </span>
          <span className="text-xs uppercase tracking-widest text-[#9AA3B2] font-semibold">
            {t.app.tagline}
          </span>
        </div>
        {/* Mobil kapat butonu */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-[#9AA3B2] hover:text-[#1F2430] hover:bg-[#EEEAFE] transition-colors"
          aria-label="Menüyü kapat"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
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
                  ? "bg-[#EEEAFE] text-[#7C6CF6] font-semibold"
                  : "text-[#5B6472] hover:bg-[#EEEAFE]/50 hover:text-[#7C6CF6]"
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

      {/* Durum Kartı */}
      <div className="mt-auto bg-[#EEEAFE] p-5 rounded-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
          <span className="text-sm font-bold text-[#5D4EE0]">Örnek Veri</span>
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Şu an demo verileri gösteriliyor. QR menü bağlandığında gerçek veriler yansıyacak.
        </p>
        <Link
          href="/analytics"
          className="bg-[#7C6CF6] text-white py-2 px-4 rounded-full text-xs font-bold w-fit hover:bg-[#6D5DF0] transition-colors"
        >
          Analitiğe Git
        </Link>
      </div>
    </aside>
  );
}
