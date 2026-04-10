import Link from "next/link";
import { getCustomers, getCustomerStats, getCustomerCount } from "@/lib/queries";
import TableExportButton from "@/components/TableExportButton";
import t from "@/lib/i18n";

export const revalidate = 60;

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [statsRes, totalCount, pagedRes, allRes] = await Promise.all([
    getCustomerStats(),
    getCustomerCount(q),
    getCustomers(PAGE_SIZE, offset, q),
    getCustomers(1000, 0, q), // for export
  ]);

  const stats = statsRes.data;
  const customers = pagedRes.data;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isEmpty = totalCount === 0;

  const exportRows = allRes.data.map((c) => ({
    "Ad": c.name,
    "Şehir": c.city,
    "Ziyaret Sayısı": c.visit_count,
    "Son Ziyaret": new Date(c.last_visit).toLocaleDateString("tr-TR"),
  }));

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">{t.customers.title}</h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.customers.subtitle}</p>
        </div>
        {!isEmpty && (
          <TableExportButton
            headers={["Ad", "Şehir", "Ziyaret Sayısı", "Son Ziyaret"]}
            rows={exportRows}
            filename="musteriler"
            label="CSV İndir"
          />
        )}
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EEEAFE] text-[#7C6CF6]"><span className="material-symbols-outlined">group</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.total}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.customers.totalCustomers}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#DBEAFE] text-[#1E40AF]"><span className="material-symbols-outlined">repeat</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.returning}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.customers.returningCustomers}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EDE9FE] text-[#6D28D9]"><span className="material-symbols-outlined">person_add</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.newThisWeek}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.customers.newThisWeek}</p>
          </div>
        </div>
      </div>

      {/* Arama + Liste */}
      <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
        <div className="px-8 py-6 border-b border-[#E9E9F2] flex justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-[#1F2430] shrink-0">{t.customers.title}</h3>
          <form method="get" className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B2] text-sm">search</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="İsim veya şehir ara..."
                className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-full py-2 pl-9 pr-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
              />
            </div>
            <button type="submit" className="bg-[#7C6CF6] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#6D5DF0] transition-colors">Ara</button>
            {q && <Link href="/customers" className="text-xs text-[#9AA3B2] hover:text-[#6B7280]">Temizle</Link>}
          </form>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#F6F6FB] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#9AA3B2]">group</span>
            </div>
            <h3 className="text-lg font-bold text-[#1F2430] mb-2">{q ? `"${q}" için sonuç bulunamadı` : "Henüz müşteri verisi yok"}</h3>
            <p className="text-sm text-[#6B7280] max-w-sm">{q ? "Farklı bir arama terimi deneyin." : "Restoranınızı ziyaret eden müşteriler QR menüyü taradığında buraya yansıyacak."}</p>
          </div>
        ) : (
          <>
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
                      <td className="px-8 py-5"><span className="text-sm text-[#6B7280]">{customer.city}</span></td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1F2430]">{customer.visit_count}</span>
                          {customer.visit_count > 1 && (
                            <span className="px-2 py-0.5 bg-[#EEEAFE] text-[#7C6CF6] rounded-full text-[10px] font-bold">Tekrar</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#6B7280]">
                        {new Date(customer.last_visit).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 border-t border-[#E9E9F2] flex items-center justify-between">
                <p className="text-xs text-[#9AA3B2]">{totalCount} müşteri · Sayfa {currentPage}/{totalPages}</p>
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <Link href={`/customers?page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                      className="px-3 py-1.5 text-xs font-bold bg-[#F6F6FB] border border-[#E9E9F2] rounded-full hover:border-[#7C6CF6] hover:text-[#7C6CF6] transition-colors">
                      ← Önceki
                    </Link>
                  )}
                  {currentPage < totalPages && (
                    <Link href={`/customers?page=${currentPage + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                      className="px-3 py-1.5 text-xs font-bold bg-[#7C6CF6] text-white rounded-full hover:bg-[#6D5DF0] transition-colors">
                      Sonraki →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
