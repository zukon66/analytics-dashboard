import t from "@/lib/i18n";

export default function TopNav() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/70 backdrop-blur-xl flex justify-between items-center px-8 h-16">
      <div className="relative w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6062] text-lg">
          search
        </span>
        <input
          className="w-full bg-[#dee3e5] border-none rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c6b00]/40 focus:bg-white transition-all"
          placeholder={t.topNav.searchPlaceholder}
          type="text"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full transition-transform active:scale-90">
          <span className="material-symbols-outlined text-[#5a6062]">
            notifications
          </span>
        </button>
        <div className="flex items-center gap-3 ml-2 border-l pl-6 border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-[#2e3335]">Alex Jensen</p>
            <p className="text-[10px] text-[#5a6062]">{t.topNav.userRole}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#aef764] flex items-center justify-center text-[#335c00] font-bold text-sm">
            AJ
          </div>
        </div>
      </div>
    </header>
  );
}
