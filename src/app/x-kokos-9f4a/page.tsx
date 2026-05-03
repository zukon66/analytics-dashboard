"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [error, action, isPending] = useActionState(login, null);

  return (
    <main className="min-h-screen bg-[#07080D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D5DF0] to-[#C084FC] flex items-center justify-center mb-4 shadow-lg shadow-[#7C6CF6]/40">
            <span className="material-symbols-outlined text-white text-2xl">shield_person</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#F7F7FF] tracking-tight">KÖK-OS</h1>
          <p className="text-sm text-[#747A93] font-medium mt-1">Yönetici Girişi</p>
        </div>

        <div className="kok-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest">Kısıtlı Erişim</span>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#747A93] uppercase tracking-wider">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747A93] text-sm select-none">
                  person
                </span>
                <input
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="admin"
                  className="w-full bg-black/30 border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-sm text-[var(--text-1)] placeholder-[#747A93] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/40 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#747A93] uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747A93] text-sm select-none">
                  lock
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-sm text-[var(--text-1)] placeholder-[#747A93] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/40 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full kok-gradient-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  Yönetici Girişi
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#747A93] mt-6">
          Bu sayfa yalnızca yetkili yöneticilere özeldir.
        </p>
      </div>
    </main>
  );
}
