import { getOrders, getOrderStats } from "@/lib/queries";
import t from "@/lib/i18n";

export const revalidate = 60;

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-[#aef764]/40 text-[#335c00]",
  pending: "bg-[#ebdcff]/60 text-[#594a74]",
  cancelled: "bg-[#fa7150]/20 text-[#671200]",
};

const STATUS_LABEL: Record<string, string> = {
  completed: t.orders.status.completed,
  pending: t.orders.status.pending,
  cancelled: t.orders.status.cancelled,
};

export default async function OrdersPage() {
  const [orders, stats] = await Promise.all([getOrders(), getOrderStats()]);

  const isEmpty = orders.length === 0;

  return (
    <main className="ml-64 pt-24 pb-12 px-8 min-h-screen bg-[#f8f9fa]">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2e3335] mb-1">
          {t.orders.title}
        </h1>
        <p className="text-[#5a6062] text-sm font-medium">{t.orders.subtitle}</p>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#aef764]/40 text-[#335c00]">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              ₺{stats.totalRevenue.toLocaleString("tr-TR")}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.orders.totalRevenue}
            </p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#a1d1fe]/40 text-[#0a476d]">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              {stats.completed}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.orders.completedOrders}
            </p>
          </div>
        </div>
        <div className="bg-[#ffffff] rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#ebdcff]/60 text-[#594a74]">
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#2e3335]">
              {stats.pending}
            </p>
            <p className="text-[10px] font-bold text-[#5a6062] uppercase tracking-tighter">
              {t.orders.pendingOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-[#ffffff] rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-[#ebeef0]">
          <h3 className="text-lg font-bold text-[#2e3335]">{t.orders.title}</h3>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="p-4 bg-[#f2f4f5] rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-[#5a6062]">
                receipt_long
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2e3335] mb-2">
              {t.orders.empty.title}
            </h3>
            <p className="text-sm text-[#5a6062] max-w-sm">
              {t.orders.empty.description}
            </p>
            <div className="mt-6 bg-[#f2f4f5] rounded-xl p-4 text-left text-xs text-[#5a6062] font-mono max-w-md">
              <p className="font-bold text-[#2e3335] mb-2">SQL şeması:</p>
              <p>create table orders (</p>
              <p className="pl-4">id bigserial primary key,</p>
              <p className="pl-4">table_id text not null,</p>
              <p className="pl-4">zone text not null,</p>
              <p className="pl-4">total_amount numeric default 0,</p>
              <p className="pl-4">status text default &apos;pending&apos;,</p>
              <p className="pl-4">created_at timestamptz default now()</p>
              <p>);</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#5a6062]">
                  <th className="px-8 py-4">{t.orders.cols.orderId}</th>
                  <th className="px-8 py-4">{t.orders.cols.tableId}</th>
                  <th className="px-8 py-4">{t.orders.cols.zone}</th>
                  <th className="px-8 py-4">{t.orders.cols.amount}</th>
                  <th className="px-8 py-4">{t.orders.cols.status}</th>
                  <th className="px-8 py-4">{t.orders.cols.time}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#f2f4f5] transition-colors border-t border-[#ebeef0]"
                  >
                    <td className="px-8 py-5">
                      <span className="font-bold text-[#2e3335]">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-semibold text-[#2e3335]">
                        {order.table_id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-[#5a6062]">{order.zone}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-[#3c6b00]">
                        ₺{Number(order.total_amount).toLocaleString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          STATUS_STYLE[order.status] ?? "bg-[#e5e9eb] text-[#5a6062]"
                        }`}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#5a6062]">
                      {new Date(order.created_at).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
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
