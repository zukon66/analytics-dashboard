interface Props {
  bizValue:    number;
  platformAvg: number;
}

export default function PlatformComparisonBadge({ bizValue, platformAvg }: Props) {
  if (platformAvg === 0) return null;
  const pct = Math.round(((bizValue - platformAvg) / platformAvg) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <div
      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 ${
        up ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#991B1B]"
      }`}
    >
      <span>{up ? "↑" : "↓"}</span>
      <span>
        Platform ort. %{Math.abs(pct)} {up ? "üstünde" : "altında"}
      </span>
    </div>
  );
}
