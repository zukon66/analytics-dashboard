import { getCustomers, getCustomerStats } from "@/lib/queries";
import t from "@/lib/i18n";

export const revalidate = 60;

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([
    getCustomers(),
    getCustomerStats(),
  ]);

  const isEmpty = customers.length === 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#f8f9fa]">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2e3335] mb-1">
          {t.customers.title}
        </h1>
        <p className="text-[#5a6062] text-sm font-medium">
          {t.customers.subtitle}
        </p>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#aef764]/40 text-[#335c00]">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              {stats.total}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.customers.totalCustomers}
            </p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#a1d1fe]/40 text-[#0a476d]">
            <span className="material-symbols-outlined">repeat</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              {stats.returning}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.customers.returningCustomers}
            </p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#ebdcff]/60 text-[#594a74]">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              {stats.newThisWeek}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.customers.newThisWeek}
            </p>
          </div>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-[#ffffff] rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-[#ebeef0]">
          <h3 className="text-lg font-bold text-[#2e3335]">
            {t.customers.title}
          </h3>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#f2f4f5] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#5a6062]">
                group
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2e3335] mb-2">
              {t.customers.empty.title}
            </h3>
            <p className="text-sm text-[#5a6062] max-w-sm">
              {t.customers.empty.description}
            </p>
            <div className="mt-6 bg-[#f2f4f5] rounded-xl p-4 text-left text-xs text-[#5a6062] font-mono max-w-md">
              <p className="font-bold text-[#2e3335] mb-2">SQL şeması:</p>
              <p>create table customers (</p>
              <p className="pl-4">id bigserial primary key,</p>
              <p className="pl-4">name text not null,</p>
              <p className="pl-4">city text not null,</p>
              <p className="pl-4">visit_count int default 1,</p>
              <p className="pl-4">last_visit timestamptz default now()</p>
              <p>);</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062]">
                  <th className="px-8 py-4">{t.customers.cols.name}</th>
                  <th className="px-8 py-4">{t.customers.cols.city}</th>
                  <th className="px-8 py-4">{t.customers.cols.visits}</th>
                  <th className="px-8 py-4">{t.customers.cols.lastVisit}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-[#f2f4f5] transition-colors border-t border-[#ebeef0]"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#aef764]/40 flex items-center justify-center text-[#335c00] font-bold text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#2e3335]">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-[#5a6062]">
                        {customer.city}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2e3335]">
                          {customer.visit_count}
                        </span>
                        {customer.visit_count > 1 && (
                          <span className="px-2 py-0.5 bg-[#aef764]/40 text-[#335c00] rounded-full text-[10px] font-bold">
                            Tekrar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#5a6062]">
                      {new Date(customer.last_visit).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
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
