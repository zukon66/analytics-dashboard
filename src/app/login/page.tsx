"use client";

import { useActionState } from "react";
import { businessLogin } from "@/app/actions/business-auth";

export default function BusinessLoginPage() {
  const [error, action, isPending] = useActionState(businessLogin, null);

  return (
    <main className="min-h-screen bg-[#07080D] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#7C6CF6]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#C084FC]/8 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl kok-gradient-button flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-2xl">monitor_heart</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">KÖK-OS</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">İşletme Paneli</p>
        </div>

        <div className="kok-card rounded-2xl p-8">
          <h2 className="text-lg font-bold text-[var(--text-1)] mb-1">Giriş Yap</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Ana projede kullandığın işletme hesabıyla devam et
          </p>

          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                E-posta
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm select-none">
                  mail
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="isletme@ornek.com"
                  className="w-full bg-black/30 border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-sm text-[var(--text-1)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/40 focus:border-[#7C6CF6] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm select-none">
                  lock
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-sm text-[var(--text-1)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/40 focus:border-[#7C6CF6] transition-all"
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
              className="w-full kok-gradient-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2"
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

          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Hesap oluşturma ve ödeme işlemleri ana proje üzerinden yönetilir.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--text-muted)] mt-6">
          KÖK-OS Analytics · İşletme Paneli
        </p>
      </div>
    </main>
  );
}
