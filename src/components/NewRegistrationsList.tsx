import Link from "next/link";
import type { NewRegistration } from "@/lib/queries";
import t from "@/lib/i18n";

interface Props {
  items: NewRegistration[];
}

const PLAN_COLORS: Record<string, string> = {
  trial:      "bg-[#F3F4F6] text-[#6B7280]",
  starter:    "bg-[#DBEAFE] text-[#1E40AF]",
  pro:        "bg-[#EDE9FE] text-[#6D28D9]",
  enterprise: "bg-[#FEF3C7] text-[#92400E]",
};

export default function NewRegistrationsList({ items }: Props) {
  return (
    <div>
      {/* Başlık */}
      <div className="px-8 py-6 border-b border-[#E9E9F2]">
        <span className="px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-2 inline-block">
          {t.growth.newBiz.badge}
        </span>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#15803D] text-lg">store</span>
          <h3 className="text-base font-bold text-[#1F2430]">{t.growth.newBiz.title}</h3>
        </div>
        <p className="text-xs text-[#6B7280] mt-0.5">{t.growth.newBiz.subtitle}</p>
      </div>

      {/* Tablo */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <span className="material-symbols-outlined text-3xl text-[#9AA3B2] mb-2">storefront</span>
          <p className="text-sm text-[#9AA3B2]">{t.growth.newBiz.empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2]">
                <th className="px-8 py-4">{t.growth.newBiz.cols.name}</th>
                <th className="px-4 py-4">{t.growth.newBiz.cols.city}</th>
                <th className="px-4 py-4">{t.growth.newBiz.cols.plan}</th>
                <th className="px-4 py-4">{t.growth.newBiz.cols.registered}</th>
                <th className="px-4 py-4 text-center">{t.growth.newBiz.cols.firstScan}</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((biz) => (
                <tr
                  key={biz.id}
                  className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#EEEAFE] flex items-center justify-center text-[#7C6CF6] font-bold text-xs flex-shrink-0">
                        {biz.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1F2430] text-sm">{biz.name}</p>
                        <p className="text-[10px] text-[#9AA3B2]">{biz.owner_email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6B7280]">{biz.city}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${PLAN_COLORS[biz.plan] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                      {biz.plan}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#6B7280]">
                    {new Date(biz.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {biz.has_first_scan ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">check</span>
                        {t.growth.newBiz.activated}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#F3F4F6] text-[#9AA3B2] px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {t.growth.newBiz.notActivated}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Link
                      href={`/businesses/${biz.id}`}
                      className="text-xs text-[#7C6CF6] font-semibold hover:underline"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
