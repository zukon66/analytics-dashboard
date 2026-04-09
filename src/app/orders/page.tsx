import Link from "next/link";
import { getOrders, getOrderStats } from "@/lib/queries";
import t from "@/lib/i18n";

export const revalidate = 60;

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

function SortHeader({
  col,
  label,
  currentSort,
  currentDir,
}: {
  col: string;
  label: string;
  currentSort: string;
  currentDir: string;
}) {
  const isActive = currentSort === col;
  const nextDir = isActive && currentDir === "desc" ? "asc" : "desc";
  return (
    <th className="px-8 py-4">
      <Link
        href={`/orders?sort=${col}&dir=${nextDir}`}
        className={`inline-flex items-center gap-1 group transition-colors ${
          isActive ? "text-[#7C6CF6]" : "text-[#9AA3B2] hover:text-[#6B7280]"
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <span className="material-symbols-outlined text-sm leading-none">
          {isActive
            ? currentDir === "asc"
              ? "arrow_upward"
              : "arrow_downward"
            : "unfold_more"}
        </span>
      </Link>
    </th>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort = "created_at", dir = "desc" } = await searchParams;
  const validSort = VALID_SORTS.includes(sort) ? sort : "created_at";
  const validDir = dir === "asc" ? "asc" : "desc";

  const [orders, stats] = await Promise.all([
    getOrders(50, validSort, validDir),
    getOrderStats(),
  ]);
  const isEmpty = orders.length === 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2430] mb-1">
          {t.orders.title}
        </h1>
        <p className="text-[#6B7280] text-sm font-medium">{t.orders.subtitle}</p>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#EEEAFE] text-[#7C6CF6]">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">
              ₺{stats.totalRevenue.toLocaleString("tr-TR")}
            </p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.orders.totalRevenue}
            </p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#15803D]">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.completed}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.orders.completedOrders}
            </p>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-xl p-6 flex items-center gap-4 border border-[#E9E9F2]">
          <div className="p-3 rounded-xl bg-[#FEF3C7] text-[#92400E]">
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1F2430]">{stats.pending}</p>
            <p className="text-[10px] font-bold text-[#9AA3B2] uppercase tracking-tighter">
              {t.orders.pendingOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E9E9F2]">
        <div className="px-8 py-6 border-b border-[#E9E9F2] flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1F2430]">{t.orders.title}</h3>
          {!isEmpty && (
            <p className="text-xs text-[#9AA3B2]">
              Başlıklara tıklayarak sıralayabilirsiniz
            </p>
          )}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#F6F6FB] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#9AA3B2]">
                receipt_long
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1F2430] mb-2">Henüz sipariş yok</h3>
            <p className="text-sm text-[#6B7280] max-w-sm">
              Müşterileriniz QR menüden sipariş verdiğinde burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <SortHeader col="id"           label={t.orders.cols.orderId} currentSort={validSort} currentDir={validDir} />
                  <SortHeader col="table_id"     label={t.orders.cols.tableId} currentSort={validSort} currentDir={validDir} />
                  <SortHeader col="zone"         label={t.orders.cols.zone}    currentSort={validSort} currentDir={validDir} />
                  <SortHeader col="total_amount" label={t.orders.cols.amount}  currentSort={validSort} currentDir={validDir} />
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#9AA3B2]">
                    {t.orders.cols.status}
                  </th>
                  <SortHeader col="created_at"   label={t.orders.cols.time}    currentSort={validSort} currentDir={validDir} />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAFAFD] transition-colors border-t border-[#E9E9F2]">
                    <td className="px-8 py-5">
                      <span className="font-bold text-[#1F2430]">#{order.id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-semibold text-[#1F2430]">{order.table_id}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-[#6B7280]">{order.zone}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-[#7C6CF6]">
                        ₺{Number(order.total_amount).toLocaleString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLE[order.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#6B7280]">
                      {new Date(order.created_at).toLocaleString("tr-TR", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
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
