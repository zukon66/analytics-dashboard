"use client";

type HourlyRow = { hour: string; scans: number };
type CityRow = { city: string; scans: number };
type ZoneRow = { zone: string; scans: number };
type WeeklyStats = { total: number; avgPerDay: number; bestDay: string };

type Props = {
  hourlyData: HourlyRow[];
  cityData: CityRow[];
  zoneData: ZoneRow[];
  weekly: WeeklyStats;
  peakHour: string;
};

export default function AnalyticsExportButton({
  hourlyData,
  cityData,
  zoneData,
  weekly,
  peakHour,
}: Props) {
  function handleExport() {
    const rows: string[] = [];

    rows.push("Menü Analitiği Raporu");
    rows.push(`Dışa Aktarma Tarihi,${new Date().toLocaleDateString("tr-TR")}`);
    rows.push("");

    rows.push("Haftalık Özet");
    rows.push("Toplam Tarama,Günlük Ortalama,En İyi Gün,Zirve Saati");
    rows.push(`${weekly.total},${weekly.avgPerDay},${weekly.bestDay},${peakHour}`);
    rows.push("");

    rows.push("Saatlik Dağılım");
    rows.push("Saat,Tarama Sayısı");
    hourlyData.forEach((r) => rows.push(`${r.hour},${r.scans}`));
    rows.push("");

    rows.push("Şehir Bazlı Tarama");
    rows.push("Şehir,Tarama Sayısı");
    cityData.forEach((r) => rows.push(`${r.city},${r.scans}`));
    rows.push("");

    rows.push("Bölge Bazlı Tarama");
    rows.push("Bölge,Tarama Sayısı");
    zoneData.forEach((r) => rows.push(`${r.zone},${r.scans}`));

    const csv = "\uFEFF" + rows.join("\n"); // BOM for Turkish chars in Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analitik-raporu-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="bg-[#7C6CF6] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#6D5DF0] transition-colors"
    >
      <span className="material-symbols-outlined text-sm">download</span>
      Dışa Aktar
    </button>
  );
}
