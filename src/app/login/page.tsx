"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, action, isPending] = useActionState(login, null);

  return (
    <main className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#7C6CF6] flex items-center justify-center mb-4 shadow-lg shadow-[#7C6CF6]/30">
            <span className="material-symbols-outlined text-white text-2xl">monitor_heart</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2430] tracking-tight">KÖK-OS</h1>
          <p className="text-sm text-[#9AA3B2] font-medium mt-1">Analitik Dashboard</p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-2xl border border-[#E9E9F2] p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#1F2430] mb-1">Giriş Yap</h2>
          <p className="text-sm text-[#9AA3B2] mb-6">Devam etmek için kimliğini doğrula</p>

          <form action={action} className="flex flex-col gap-4">

            {/* Kullanıcı adı */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B2] text-sm select-none">
                  person
                </span>
                <input
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="kullanıcı adı"
                  className="w-full bg-[#FAFAFD] border border-[#E9E9F2] rounded-xl py-3 pl-9 pr-4 text-sm text-[#1F2430] placeholder-[#C4C9D4] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B2] text-sm select-none">
                  lock
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#FAFAFD] border border-[#E9E9F2] rounded-xl py-3 pl-9 pr-4 text-sm text-[#1F2430] placeholder-[#C4C9D4] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>

            {/* Hata mesajı */}
            {error && (
              <div className="flex items-center gap-2 bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold px-4 py-3 rounded-xl">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Giriş butonu */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#7C6CF6] hover:bg-[#6D5DF0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">login</span>
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#C4C9D4] mt-6">
          KÖK-OS Analytics · Yetkisiz erişim yasaktır
        </p>
      </div>
    </main>
  );
}
