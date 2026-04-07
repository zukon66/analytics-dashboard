"use client";

import { useState } from "react";
import t from "@/lib/i18n";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    dailyReport: true,
    peakAlert: true,
    weeklyInsight: false,
  });

  function handleSave() {
    setSaving(true);
    setSaved(false);
    // Gerçek implementasyonda Supabase'e kaydedilir
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#f8f9fa]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2e3335] mb-1">
            {t.settings.title}
          </h1>
          <p className="text-[#5a6062] text-sm font-medium">
            {t.settings.subtitle}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#3c6b00] text-[#eeffd6] px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 disabled:opacity-60 transition-all"
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
          <section className="bg-[#ffffff] rounded-xl p-8">
            <h2 className="text-base font-bold text-[#2e3335] mb-6">
              {t.settings.sections.profile}
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062] block mb-2">
                  {t.settings.fields.name}
                </label>
                <input
                  defaultValue="Alex Jensen"
                  className="w-full bg-[#dee3e5] border-none rounded-md py-2.5 px-4 text-sm text-[#2e3335] focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062] block mb-2">
                  {t.settings.fields.email}
                </label>
                <input
                  defaultValue="alex@restoran.com"
                  type="email"
                  className="w-full bg-[#dee3e5] border-none rounded-md py-2.5 px-4 text-sm text-[#2e3335] focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all"
                />
              </div>
            </div>
          </section>

          {/* Restoran Ayarları */}
          <section className="bg-[#ffffff] rounded-xl p-8">
            <h2 className="text-base font-bold text-[#2e3335] mb-6">
              {t.settings.sections.restaurant}
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062] block mb-2">
                  {t.settings.fields.restaurantName}
                </label>
                <input
                  defaultValue="KÖK Restoran"
                  className="w-full bg-[#dee3e5] border-none rounded-md py-2.5 px-4 text-sm text-[#2e3335] focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062] block mb-2">
                    {t.settings.fields.city}
                  </label>
                  <input
                    defaultValue="İstanbul"
                    className="w-full bg-[#dee3e5] border-none rounded-md py-2.5 px-4 text-sm text-[#2e3335] focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062] block mb-2">
                    {t.settings.fields.timezone}
                  </label>
                  <select className="w-full bg-[#dee3e5] border-none rounded-md py-2.5 px-4 text-sm text-[#2e3335] focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all">
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
          <section className="bg-[#ffffff] rounded-xl p-8">
            <h2 className="text-base font-bold text-[#2e3335] mb-6">
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
                    <p className="text-sm font-semibold text-[#2e3335]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#5a6062] mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
                      notifications[item.key] ? "bg-[#3c6b00]" : "bg-[#dee3e5]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                        notifications[item.key]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Tehlikeli Alan */}
          <section className="bg-[#fa7150]/10 rounded-xl p-8">
            <h2 className="text-base font-bold text-[#671200] mb-2">
              {t.settings.sections.danger}
            </h2>
            <p className="text-xs text-[#671200]/80 mb-5">
              {t.settings.danger.deleteDesc}
            </p>
            <button className="bg-[#aa371c] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#671200] transition-colors">
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              {t.settings.danger.deleteButton}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
