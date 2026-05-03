"use client";

type Row = Record<string, string | number>;

type Props = {
  headers: string[];
  rows: Row[];
  filename: string;
  label?: string;
};

export default function TableExportButton({ headers, rows, filename, label = "Dışa Aktar" }: Props) {
  function handleExport() {
    const lines: string[] = [];
    lines.push(headers.join(","));
    rows.forEach((row) => {
      lines.push(Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="kok-soft-button px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 text-[var(--text-1)] hover:border-[#7C6CF6] hover:text-[var(--accent)] transition-colors"
    >
      <span className="material-symbols-outlined text-sm">download</span>
      {label}
    </button>
  );
}
