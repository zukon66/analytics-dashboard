import Link from "next/link";
import { getOrders, getOrderStats, getConversionRate } from "@/lib/queries";
import TableExportButton from "@/components/TableExportButton";
import t from "@/lib/i18n";

export const revalidate = 60;

const PAGE_SIZE = 20;

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-[#DCFCE7] text-[#15803D]",
  pending:   "bg-[#FEF3C7] text-[#92400E]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
};
const STATUS_LABEL: Record<string, string> = {
  completed: t.orders.status.completed,
  pending:   t.orders.status.pending,
  cancelled: t.orders.status.cancelled,
};
const VALID_SORTS = ["id", "table_id", "total_amount", "created_at", "zone"];

function SortHeader({ col, label, currentSort, currentDir, search }: { col: string; label: string; currentSort: string; currentDir: string; search: string }) {
  const isActive = currentSort === col;
  const nextDir = isActive && currentDir === "desc" ? "asc" : "desc";
  const href = `/orders?sort=${col}&dir=${nextDir}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
  return (
    <th className="px-8 py-4">
      <Link href={href} className={`inline-flex items-center gap-1 transition-colors ${isActive ? "text-[#7C6CF6]" : "text-[#9AA3B2] hover:text-[#6B7280]"}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <span className="material-symbols-outlined text-sm leading-none">
          {isActive ? (currentDir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
        </span>
      </Link>
    </th>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; q?: string; page?: string }>;
}) {
  const { sort = "created_at", dir = "desc", q = "", page = "1" } = await searchParams;
  const validSort = VALID_SORTS.includes(sort) ? sort : "created_at";
  const validDir = dir === "asc" ? "asc" : "desc";
  const currentPage = Math.max(1, parseInt(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [ordersRes, statsRes, convRes, allOrdersRes] = await Promise.all([
    getOrders(PAGE_SIZE, validSort, validDir, q),
    getOrderStats(),
    getConversionRate(),
    getOrders(1000, validSort, validDir, q), // for export & count
  ]);

  const orders = ordersRes.data;
  const stats = statsRes.data;
  const conv = convRes.data;
  const totalCount = allOrdersRes.data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagedOrders = allOrdersRes.data.slice(offset, offset + PAGE_SIZE);
  const isEmpty = totalCount === 0;

  const exportRows = allOrdersRes.data.map((o) => ({
    "Sipariş No": o.id,
    "Masa": o.table_id,
    "Bölge": o.zone,
    "Tutar (₺)": Number(o.total_amount),
    "Durum": STATUS_LABEL[o.status] ?? o.status,
    "Tarih": new Date(o.created_at).toLocaleString("tr-TR"),
  }));

  void orders;

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">{t.orders.title}</h1>
          <p className="text-[#6B7280] text-sm font-medium">{t.orders.subtitle}</p>
        </div>
        {!isEmpty && (
          <TableExportButton
            headers={["Sipariş No", "Masa", "Bölge", "Tutar (₺)", "Durum", "Tarih"]}
            rows={exportRows}
            filename="siparisler"
            label="CSV İndir"
          />
        )}
      </div>

      {/* KPI Şeridi — 5 kart */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EEEAFE] text-[#7C6CF6]"><span className="material-symbols-outlined">payments</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">₺{stats.totalRevenue.toLocaleString("tr-TR")}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.orders.totalRevenue}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EEEAFE] text-[#7C6CF6]"><span className="material-symbols-outlined">receipt</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">₺{stats.avgAmount.toLocaleString("tr-TR")}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">Ort. Sipariş Tutarı</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#15803D]"><span className="material-symbols-outlined">check_circle</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.completed}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.orders.completedOrders}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#FEF3C7] text-[#92400E]"><span className="material-symbols-outlined">hourglass_empty</span></div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.pending}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">{t.orders.pendingOrders}</p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className={`p-3 rounded-xl ${stats.cancelRate > 15 ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">%{stats.cancelRate}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">İptal Oranı</p>
          </div>
        </div>
      </div>

      {/* Dönüşüm Oranı Banner */}
      <div className="bg-[#EEEAFE] border border-[#D4CFFE] rounded-xl px-8 py-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#7C6CF6] text-2xl">conversion_path</span>
          <div>
            <p className="text-sm font-bold text-[#1F2430]">QR Tarama → Sipariş Dönüşümü</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{conv.scanCount.toLocaleString("tr-TR")} taramadan {conv.orderCount.toLocaleString("tr-TR")} sipariş oluştu</p>
          </div>
        </div>
        <p className="text-3xl font-extrabold text-[#7C6CF6]">%{conv.rate}</p>
      </div>

      {/* Arama + Tablo */}
      <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
        <div className="px-8 py-6 border-b border-[#E9E9F2] flex justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-[#1F2430] shrink-0">{t.orders.title}</h3>
          <form method="get" className="flex items-center gap-2 flex-1 max-w-sm">
            {sort !== "created_at" && <input type="hidden" name="sort" value={validSort} />}
            {dir !== "desc" && <input type="hidden" name="dir" value={validDir} />}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B2] text-sm">search</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Masa veya bölge ara..."
                className="w-full bg-[#FCFCFE] border border-[#E9E9F2] rounded-full py-2 pl-9 pr-4 text-sm text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C6CF6]/30 focus:border-[#7C6CF6] transition-all"
              />
            </div>
            <button type="submit" className="bg-[#7C6CF6] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#6D5DF0] transition-colors">Ara</button>
            {q && <Link href={`/orders?sort=${validSort}&dir=${validDir}`} className="text-xs text-[#9AA3B2] hover:text-[#6B7280]">Temizle</Link>}
          </form>
          {!isEmpty && <p className="text-xs text-[#9AA3B2] shrink-0">Başlıklara tıklayarak sıralayabilirsiniz</p>}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#F6F6FB] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#9AA3B2]">receipt_long</span>
            </div>
            <h3 className="text-lg font-bold text-[#1F2430] mb-2">{q ? `"${q}" için sonuç bulunamadı` : "Henüz sipariş yok"}</h3>
            <p className="text-sm text-[#6B7280] max-w-sm">{q ? "Farklı bir arama terimi deneyin." : "Müşterileriniz QR menüden sipariş verdiğinde burada görüntülenecek."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <SortHeader col="id"           label={t.orders.cols.orderId} currentSort={validSort} currentDir={validDir} search={q} />
                    <SortHeader col="table_id"     label={t.orders.cols.tableId} currentSort={validSort} currentDir={validDir} search={q} />
                    <SortHeader col="zone"         label={t.orders.cols.zone}    currentSort={validSort} currentDir={validDir} search={q} />
                    <SortHeader col="total_amount" label={t.orders.cols.amount}  currentSort={validSort} currentDir={validDir} search={q} />
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2]">{t.orders.cols.status}</th>
                    <SortHeader col="created_at"   label={t.orders.cols.time}    currentSort={validSort} currentDir={validDir} search={q} />
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]">
                      <td className="px-8 py-5"><span className="font-bold text-[#1F2430]">#{order.id}</span></td>
                      <td className="px-8 py-5"><span className="font-semibold text-[#1F2430]">{order.table_id}</span></td>
                      <td className="px-8 py-5"><span className="text-sm text-[#6B7280]">{order.zone}</span></td>
                      <td className="px-8 py-5"><span className="font-bold text-[#7C6CF6]">₺{Number(order.total_amount).toLocaleString("tr-TR")}</span></td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLE[order.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#6B7280]">
                        {new Date(order.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 border-t border-[#E9E9F2] flex items-center justify-between">
                <p className="text-xs text-[#9AA3B2]">{totalCount} sipariş · Sayfa {currentPage}/{totalPages}</p>
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <Link href={`/orders?sort=${validSort}&dir=${validDir}&page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                      className="px-3 py-1.5 text-xs font-bold bg-[#F6F6FB] border border-[#E9E9F2] rounded-full hover:border-[#7C6CF6] hover:text-[#7C6CF6] transition-colors">
                      ← Önceki
                    </Link>
                  )}
                  {currentPage < totalPages && (
                    <Link href={`/orders?sort=${validSort}&dir=${validDir}&page=${currentPage + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
