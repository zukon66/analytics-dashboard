import Link from "next/link";
import { getCustomers, getCustomerStats, getCustomerCount, getCustomerGrowthTrend } from "@/lib/queries";
import TableExportButton from "@/components/TableExportButton";
import CustomerGrowthChart from "@/components/charts/CustomerGrowthChart";
import t from "@/lib/i18n";

export const revalidate = 60;

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; trend?: string }>;
}) {
  const { q = "", page = "1", trend = "weekly" } = await searchParams;
  const granularity = trend === "monthly" ? "monthly" : "weekly" as "weekly" | "monthly";
  const currentPage = Math.max(1, parseInt(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [statsRes, totalCount, pagedRes, allRes, trendRes] = await Promise.all([
    getCustomerStats(),
    getCustomerCount(q),
    getCustomers(PAGE_SIZE, offset, q),
    getCustomers(1000, 0, q), // for export
    getCustomerGrowthTrend(granularity),
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
    <main className="kok-page kok-fade-in pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-1)] mb-1">{t.customers.title}</h1>
          <p className="text-[var(--text-2)] text-sm font-medium">{t.customers.subtitle}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
          <div className="kok-icon-tile p-3 rounded-2xl text-[var(--accent)]"><span className="material-symbols-outlined">group</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-1)]">{stats.total}</p>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{t.customers.totalCustomers}</p>
          </div>
        </div>
        <div className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
          <div className="kok-icon-tile p-3 rounded-2xl text-sky-300"><span className="material-symbols-outlined">repeat</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-1)]">{stats.returning}</p>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{t.customers.returningCustomers}</p>
          </div>
        </div>
        <div className="kok-card kok-card-hover rounded-3xl p-6 flex items-center gap-4">
          <div className="kok-icon-tile p-3 rounded-2xl text-fuchsia-300"><span className="material-symbols-outlined">person_add</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-1)]">{stats.newThisWeek}</p>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{t.customers.newThisWeek}</p>
          </div>
        </div>
      </div>

      {/* Büyüme Trendi */}
      <CustomerGrowthChart data={trendRes.data} granularity={granularity} />

      {/* Arama + Liste */}
      <div className="kok-card rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--border)] flex justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-[var(--text-1)] shrink-0">{t.customers.title}</h3>
          <form method="get" className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="İsim veya şehir ara..."
                className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-full py-2 pl-9 pr-4 text-sm text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
              />
            </div>
            <button type="submit" className="bg-[#7C6CF6] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#6D5DF0] transition-colors">Ara</button>
            {q && <Link href="/customers" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-2)]">Temizle</Link>}
          </form>
        </div>

        {isEmpty ? (
          <div className="kok-empty flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="kok-icon-tile p-4 rounded-full mb-4 kok-pulse-soft">
              <span className="material-symbols-outlined text-4xl text-[var(--accent)]">group</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-1)] mb-2">{q ? `"${q}" için sonuç bulunamadı` : "Henüz müşteri verisi yok"}</h3>
            <p className="text-sm text-[var(--text-2)] max-w-sm">{q ? "Farklı bir arama terimi deneyin." : "Restoranınızı ziyaret eden müşteriler QR menüyü taradığında buraya yansıyacak."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    <th className="px-8 py-4">{t.customers.cols.name}</th>
                    <th className="px-8 py-4">{t.customers.cols.city}</th>
                    <th className="px-8 py-4">{t.customers.cols.visits}</th>
                    <th className="px-8 py-4">{t.customers.cols.lastVisit}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/[0.035] transition-colors border-t border-[var(--border)]">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-2xl kok-icon-tile flex items-center justify-center text-[var(--accent)] font-bold text-xs">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[var(--text-1)]">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5"><span className="text-sm text-[var(--text-2)]">{customer.city}</span></td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-1)]">{customer.visit_count}</span>
                          {customer.visit_count > 1 && (
                            <span className="px-2 py-0.5 bg-[var(--accent-bg)] text-[#7C6CF6] rounded-full text-[10px] font-bold">Tekrar</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-[var(--text-2)]">
                        {new Date(customer.last_visit).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 border-t border-[var(--border)] flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)]">{totalCount} müşteri · Sayfa {currentPage}/{totalPages}</p>
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <Link href={`/customers?page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                      className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-full hover:border-[#7C6CF6] hover:text-[#7C6CF6] transition-colors">
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
