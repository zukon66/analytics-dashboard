"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { businessLogout } from "@/app/actions/business-auth";
import t from "@/lib/i18n";

const GLOSSARY = [
  { term: "QR Tarama", def: "Müşterinin menü QR kodunu telefonu ile okutması. Her okutma bir tarama sayılır." },
  { term: "MRR", def: "Monthly Recurring Revenue — İşletmelerin aylık abonelik ödemeleri toplamı (₺)." },
  { term: "Trial (Deneme)", def: "Ödeme yapılmadan kullanılan 14 günlük deneme sürecindeki işletme." },
  { term: "Churn Riski", def: "Son 14 gündür hiç QR taraması almamış, platform bağlantısı kopma riski taşıyan işletme." },
  { term: "Aktivasyon", def: "İşletmenin ilk kez QR taraması alarak sisteme aktif olarak dahil olması." },
  { term: "Pasif İşletme", def: "Son 14 gündür hiç tarama aktivitesi olmayan işletme. Aksiyon gerektirir." },
  { term: "Plan", def: "İşletmenin abonelik paketi: Trial → Starter → Pro → Enterprise sıralamasıyla ilerler." },
  { term: "Haftalık Tarama", def: "Son 7 günde o işletmenin aldığı toplam QR taraması sayısı." },
  { term: "Aktivasyon Oranı", def: "Platforma kayıtlı işletmeler içinden en az bir tarama almış olanların yüzdesi." },
  { term: "MRR · Trial · Aktivasyon", def: "Büyüme panelindeki üç ana metrik: gelir tabanı, deneme havuzu ve dönüşüm sağlığı." },
];

const navItems = [
  { href: "/", icon: "monitor_heart", label: t.nav.dashboard, exact: true },
  { href: "/businesses", icon: "store", label: t.businesses.title, exact: false },
  { href: "/growth", icon: "trending_up", label: t.nav.growth, exact: true },
  { href: "/settings", icon: "settings", label: t.nav.settings, exact: true },
];

const portalNavItems = [
  { href: "/portal", icon: "monitor_heart", label: "Gösterge Paneli", exact: true },
  { href: "/portal/analytics", icon: "query_stats", label: "Analitik", exact: false },
  { href: "/portal/orders", icon: "receipt_long", label: "Siparişler", exact: false },
  { href: "/portal/customers", icon: "table_restaurant", label: "Masa Performansı", exact: false },
  { href: "/portal/growth", icon: "trending_up", label: "Büyüme", exact: false },
  { href: "/portal/settings", icon: "settings", label: "Ayarlar", exact: false },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const isPortal = pathname.startsWith("/portal");
  const items = isPortal ? portalNavItems : navItems;
  const logoutAction = isPortal ? businessLogout : logout;

  return (
    <>
    <aside
      className={`h-screen w-64 fixed left-0 top-0 flex flex-col p-5 space-y-5 z-50
        transform transition-transform duration-300
        bg-[var(--bg-sidebar)]/95 border-r border-[var(--border)] backdrop-blur-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
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

      <nav className="flex flex-col space-y-1.5">
        {items.map((item) => {
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

      {/* Sözlük butonu */}
      <button
        type="button"
        onClick={() => setGlossaryOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-muted)] hover:bg-[var(--accent-bg)]/50 hover:text-[var(--text-1)] transition-colors text-sm font-semibold"
      >
        <span className="material-symbols-outlined text-xl">menu_book</span>
        Terimler Sözlüğü
      </button>

      <form action={logoutAction} className="border-t border-[var(--border)] pt-4">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Çıkış Yap
        </button>
      </form>

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
          href={isPortal ? "/portal/analytics" : "/businesses"}
          className="kok-gradient-button text-white py-2 px-4 rounded-full text-xs font-bold w-fit hover:opacity-90 transition-opacity"
        >
          İşletmeleri Gör
        </Link>
      </div>
    </aside>

    {/* Sözlük modal */}
    {glossaryOpen && (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={() => setGlossaryOpen(false)}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
        <div
          className="relative kok-card rounded-3xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col kok-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--accent)]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              <h3 className="text-base font-bold text-[var(--text-1)]">Terimler Sözlüğü</h3>
            </div>
            <button
              onClick={() => setGlossaryOpen(false)}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-1)] hover:bg-[var(--accent-bg)] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="overflow-y-auto space-y-4 pr-1">
            {GLOSSARY.map(({ term, def }) => (
              <div key={term} className="border-l-2 border-[var(--accent)]/40 pl-3">
                <p className="text-sm font-bold text-[var(--text-1)]">{term}</p>
                <p className="text-xs text-[var(--text-2)] leading-relaxed mt-0.5">{def}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
