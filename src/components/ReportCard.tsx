"use client";

import type { MrrTrendPoint, MrrPlanBreakdown, TrialExpiration, NewRegistration } from "@/lib/queries";

type ReportCardProps = {
  totalMrr: number;
  mrrTrend: MrrTrendPoint[];
  breakdown: MrrPlanBreakdown[];
  trials: TrialExpiration[];
  newRegs: NewRegistration[];
  totalBusinesses: number;
  activeBusinesses: number;
};

function escapeCSV(val: string | number | null | undefined): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCSV(props: ReportCardProps): string {
  const now = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const lines: string[] = [
    `KÖK-OS Platform Raporu — ${now}`,
    "",
    "=== GENEL ÖZET ===",
    `Toplam İşletme,${props.totalBusinesses}`,
    `Aktif İşletme,${props.activeBusinesses}`,
    `Güncel MRR (₺),${props.totalMrr}`,
    "",
    "=== MRR TRENDİ (Son 12 Ay) ===",
    "Ay,Gelir (₺)",
    ...props.mrrTrend.map((p) => `${escapeCSV(p.month_label)},${p.revenue}`),
    "",
    "=== PLAN DAĞILIMI ===",
    "Plan,İşletme Sayısı,Plan Ücreti (₺),Plan MRR (₺)",
    ...props.breakdown.map(
      (b) =>
        `${escapeCSV(b.plan)},${b.business_count},${b.plan_fee},${b.plan_mrr}`
    ),
    "",
    "=== TRİAL BİTİŞ UYARILARI ===",
    "İşletme,Şehir,E-posta,Kalan Gün,Bitiş Tarihi",
    ...props.trials.map(
      (t) =>
        `${escapeCSV(t.name)},${escapeCSV(t.city)},${escapeCSV(t.owner_email)},${t.days_remaining},${t.trial_ends_at.split("T")[0]}`
    ),
    "",
    "=== YENİ KAYITLAR (Son 30 Gün) ===",
    "İşletme,Şehir,Plan,E-posta,Kayıt Tarihi,İlk Tarama",
    ...props.newRegs.map(
      (r) =>
        `${escapeCSV(r.name)},${escapeCSV(r.city)},${escapeCSV(r.plan)},${escapeCSV(r.owner_email)},${r.created_at.split("T")[0]},${r.has_first_scan ? "Evet" : "Hayır"}`
    ),
  ];

  return lines.join("\n");
}

function downloadCSV(content: string, filename: string) {
  const bom = "\uFEFF"; // Excel UTF-8 BOM
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportCard(props: ReportCardProps) {
  const now = new Date();
  const reportName = `kokos-rapor-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`;

  function handleDownload() {
    const csv = buildCSV(props);
    downloadCSV(csv, reportName);
  }

  const lastMonth = props.mrrTrend[props.mrrTrend.length - 1];
  const prevMonth = props.mrrTrend[props.mrrTrend.length - 2];
  const mrrGrowth =
    prevMonth && prevMonth.revenue > 0
      ? Math.round(((lastMonth?.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
      : null;

  return (
    <div className="kok-card rounded-3xl overflow-hidden">
      {/* Başlık */}
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-3">
        <span className="material-symbols-outlined text-[#7C6CF6]">summarize</span>
        <div>
          <h3 className="text-base font-bold text-[var(--text-1)]">Platform Raporu</h3>
          <p className="text-xs text-[var(--text-muted)]">Tüm verileri tek CSV dosyası olarak indir</p>
        </div>
      </div>

      {/* İçerik özeti */}
      <div className="px-6 py-5">
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Rapor İçeriği</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "payments",    label: "MRR Trendi",       sub: "Son 12 ay" },
            { icon: "pie_chart",   label: "Plan Dağılımı",    sub: `${props.breakdown.length} plan` },
            { icon: "timer",       label: "Trial Uyarıları",  sub: `${props.trials.length} işletme` },
            { icon: "storefront",  label: "Yeni Kayıtlar",    sub: `${props.newRegs.length} işletme` },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 bg-white/[0.035] rounded-2xl border border-[var(--border)]"
            >
              <span className="material-symbols-outlined text-sm text-[#7C6CF6]">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-[var(--text-1)]">{item.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MRR özeti */}
        <div className="bg-white/[0.035] rounded-2xl p-4 mb-5 flex items-center justify-between border border-[var(--border)]">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Güncel MRR</p>
            <p className="text-2xl font-extrabold text-[var(--text-1)]">
              ₺{props.totalMrr.toLocaleString("tr-TR")}
            </p>
          </div>
          {mrrGrowth !== null && (
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                mrrGrowth >= 0
                  ? "bg-[#DCFCE7] text-[#15803D]"
                  : "bg-[#FEE2E2] text-[#991B1B]"
              }`}
            >
              {mrrGrowth >= 0 ? "+" : ""}
              {mrrGrowth}% geçen aya göre
            </div>
          )}
        </div>

        {/* İndir butonu */}
        <button
          onClick={handleDownload}
          className="kok-gradient-button w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 px-5 rounded-2xl hover:opacity-95 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          CSV Raporu İndir
        </button>
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">{reportName}</p>
      </div>
    </div>
  );
}
