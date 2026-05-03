// Anomali Tespiti: Son 7 günü önceki 7 günle karşılaştırır,
// ortalamadan %60'tan fazla sapan günleri işaretler.

type DailyPoint = { date: string; scans: number };

type Anomaly = {
  date: string;
  label: string;
  scans: number;
  baseline: number;
  pctChange: number;
  direction: "up" | "down";
};

function detectAnomalies(daily: DailyPoint[], threshold = 0.6): Anomaly[] {
  if (daily.length < 8) return [];

  const prev7 = daily.slice(0, 7);   // eski hafta
  const curr7 = daily.slice(7, 14);  // bu hafta

  const baseline =
    prev7.reduce((s, d) => s + d.scans, 0) / Math.max(prev7.length, 1);

  if (baseline === 0) return [];

  const anomalies: Anomaly[] = [];
  for (const point of curr7) {
    const pct = (point.scans - baseline) / baseline;
    if (Math.abs(pct) >= threshold) {
      const d = new Date(point.date);
      anomalies.push({
        date: point.date,
        label: d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" }),
        scans: point.scans,
        baseline: Math.round(baseline),
        pctChange: Math.round(pct * 100),
        direction: pct > 0 ? "up" : "down",
      });
    }
  }
  return anomalies;
}

export default function AnomalyAlert({ daily }: { daily: DailyPoint[] }) {
  const anomalies = detectAnomalies(daily);

  if (anomalies.length === 0) return null;

  return (
    <div className="kok-card mb-6 rounded-3xl overflow-hidden border-amber-300/20">
      {/* Başlık */}
      <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-300/20 flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-300">sensors</span>
        <div>
          <h3 className="text-sm font-bold text-amber-100">Anomali Tespiti</h3>
          <p className="text-xs text-amber-200/80">
            Bu haftaki tarama sayıları geçen haftanın ortalamasından belirgin şekilde sapıyor
          </p>
        </div>
        <span className="ml-auto bg-amber-400/15 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {anomalies.length} anormal gün
        </span>
      </div>

      {/* Anomali listesi */}
      <div className="divide-y divide-[var(--border)]">
        {anomalies.map((a) => (
          <div key={a.date} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.035] transition-colors">
            {/* Yön ikonu */}
            <div
              className={`p-2 rounded-lg shrink-0 ${
                a.direction === "up" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {a.direction === "up" ? "trending_up" : "trending_down"}
              </span>
            </div>

            {/* Tarih & açıklama */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-1)]">{a.label}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Beklenen ort: <span className="font-semibold">{a.baseline} tarama</span>
              </p>
            </div>

            {/* Gerçekleşen */}
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[var(--text-1)]">
                {a.scans.toLocaleString("tr-TR")} tarama
              </p>
              <p
                className={`text-xs font-bold ${
                  a.direction === "up" ? "text-[#15803D]" : "text-[#991B1B]"
                }`}
              >
                {a.direction === "up" ? "+" : ""}
                {a.pctChange}% sapma
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alt bilgi */}
      <div className="px-6 py-3 bg-amber-500/10 border-t border-amber-300/20">
        <p className="text-[10px] text-amber-200/80">
          Eşik: Geçen hafta günlük ortalamasına göre ±%60 sapma · Veri: Son 14 gün
        </p>
      </div>
    </div>
  );
}
