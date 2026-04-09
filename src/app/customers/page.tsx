import { getCustomers, getCustomerStats } from "@/lib/queries";
import t from "@/lib/i18n";

export const revalidate = 60;

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([getCustomers(), getCustomerStats()]);
  const isEmpty = customers.length === 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">
          {t.customers.title}
        </h1>
        <p className="text-[#6B7280] text-sm font-medium">{t.customers.subtitle}</p>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EEEAFE] text-[#7C6CF6]">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.total}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.customers.totalCustomers}
            </p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#DBEAFE] text-[#1E40AF]">
            <span className="material-symbols-outlined">repeat</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.returning}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.customers.returningCustomers}
            </p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EDE9FE] text-[#6D28D9]">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.newThisWeek}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.customers.newThisWeek}
            </p>
          </div>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
        <div className="px-8 py-6 border-b border-[#E9E9F2]">
          <h3 className="text-lg font-bold text-[#1F2430]">{t.customers.title}</h3>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#F6F6FB] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#9AA3B2]">group</span>
            </div>
            <h3 className="text-lg font-bold text-[#1F2430] mb-2">Henüz müşteri verisi yok</h3>
            <p className="text-sm text-[#6B7280] max-w-sm">
              Restoranınızı ziyaret eden müşteriler QR menüyü taradığında buraya yansıyacak.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2]">
                  <th className="px-8 py-4">{t.customers.cols.name}</th>
                  <th className="px-8 py-4">{t.customers.cols.city}</th>
                  <th className="px-8 py-4">{t.customers.cols.visits}</th>
                  <th className="px-8 py-4">{t.customers.cols.lastVisit}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EEEAFE] flex items-center justify-center text-[#7C6CF6] font-bold text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#1F2430]">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-[#6B7280]">{customer.city}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1F2430]">{customer.visit_count}</span>
                        {customer.visit_count > 1 && (
                          <span className="px-2 py-0.5 bg-[#EEEAFE] text-[#7C6CF6] rounded-full text-[10px] font-bold">
                            Tekrar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#6B7280]">
                      {new Date(customer.last_visit).toLocaleDateString("tr-TR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
