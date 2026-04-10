"use client";

import { useState } from "react";
import t from "@/lib/i18n";

const STORAGE_KEY = "kok_settings";

type Settings = {
  name: string;
  email: string;
  restaurantName: string;
  city: string;
  timezone: string;
  notifications: {
    dailyReport: boolean;
    peakAlert: boolean;
    weeklyInsight: boolean;
  };
};

const DEFAULT_SETTINGS: Settings = {
  name: "Restoran Sahibi",
  email: "sahip@restoran.com",
  restaurantName: "KÖK Restoran",
  city: "İstanbul",
  timezone: "Europe/Istanbul (UTC+3)",
  notifications: {
    dailyReport: true,
    peakAlert: true,
    weeklyInsight: false,
  },
};

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Settings;
    } catch {}
    return DEFAULT_SETTINGS;
  });

  function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  }

  function update(key: keyof Omit<Settings, "notifications">, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function toggleNotification(key: keyof Settings["notifications"]) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  }

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">
            {t.settings.title}
          </h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.settings.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#7C6CF6] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 disabled:opacity-60 hover:bg-[#6D5DF0] transition-colors"
        >
          {saved ? (
            <>
              <span className="material-symbols-outlined text-sm">check</span>
              {t.settings.saved}
            </>
          ) : saving ? (
            t.settings.saving
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              {t.settings.save}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sol kolon */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Profil */}
          <section className="bg-[#FFFFFF] rounded-xl p-8 border border-[#E9E9F2]">
            <h2 className="text-base font-bold text-[#1F2430] mb-6">
              {t.settings.sections.profile}
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] block mb-2">
                  {t.settings.fields.name}
                </label>
                <input
                  value={settings.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-md py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] block mb-2">
                  {t.settings.fields.email}
                </label>
                <input
                  value={settings.email}
                  onChange={(e) => update("email", e.target.value)}
                  type="email"
                  className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-md py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>
          </section>

          {/* Restoran Ayarları */}
          <section className="bg-[#FFFFFF] rounded-xl p-8 border border-[#E9E9F2]">
            <h2 className="text-base font-bold text-[#1F2430] mb-6">
              {t.settings.sections.restaurant}
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] block mb-2">
                  {t.settings.fields.restaurantName}
                </label>
                <input
                  value={settings.restaurantName}
                  onChange={(e) => update("restaurantName", e.target.value)}
                  className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-md py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] block mb-2">
                    {t.settings.fields.city}
                  </label>
                  <input
                    value={settings.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-md py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2] block mb-2">
                    {t.settings.fields.timezone}
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                    className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-md py-2.5 px-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                  >
                    <option>Europe/Istanbul (UTC+3)</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sağ kolon */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Bildirimler */}
          <section className="bg-[#FFFFFF] rounded-xl p-8 border border-[#E9E9F2]">
            <h2 className="text-base font-bold text-[#1F2430] mb-6">
              {t.settings.sections.notifications}
            </h2>
            <div className="flex flex-col gap-6">
              {(
                [
                  {
                    key: "dailyReport" as const,
                    label: t.settings.notifications.dailyReport,
                    desc: t.settings.notifications.dailyReportDesc,
                  },
                  {
                    key: "peakAlert" as const,
                    label: t.settings.notifications.peakAlert,
                    desc: t.settings.notifications.peakAlertDesc,
                  },
                  {
                    key: "weeklyInsight" as const,
                    label: t.settings.notifications.weeklyInsight,
                    desc: t.settings.notifications.weeklyInsightDesc,
                  },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1F2430]">{item.label}</p>
                    <p className="text-xs text-[#9AA3B2] mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                      settings.notifications[item.key] ? "bg-[#7C6CF6]" : "bg-[#E9E9F2]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                        settings.notifications[item.key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Bilgi Kartı */}
          <section className="bg-[#EEEAFE] rounded-xl p-8 border border-[#D4CFFE]">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#7C6CF6] rounded-xl">
                <span className="material-symbols-outlined text-white text-xl">
                  qr_code_scanner
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1F2430] mb-1">QR Menü Bağlantısı</p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Verileriniz QR menünüzdeki taramalardan otomatik olarak güncellenir.
                  Müşterileriniz menüyü her taradığında bu panel anlık olarak yansıtır.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
