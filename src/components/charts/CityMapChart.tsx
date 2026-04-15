type CityData = { city: string; scans: number };

interface Props {
  data:   CityData[];
  title?: string;
}

// Yaklaşık koordinatlar (lat, lng) — Silifke/Mersin bölgesi
const CITY_COORDS: Record<string, [number, number]> = {
  "Silifke":  [36.37, 33.93],
  "Mersin":   [36.80, 34.62],
  "Tarsus":   [36.92, 34.90],
  "Adana":    [37.00, 35.32],
  "Erdemli":  [36.61, 34.30],
  "Mut":      [36.64, 33.43],
  "Anamur":   [36.07, 32.83],
  "Alanya":   [36.54, 32.00],
  "Antalya":  [36.89, 30.71],
  "Gaziantep":[37.06, 37.38],
  "İstanbul": [41.01, 28.95],
  "Ankara":   [39.93, 32.85],
  "İzmir":    [38.41, 27.13],
};

// SVG viewport boyutları
const SVG_W = 400;
const SVG_H = 220;

// Bölge sınırları (Silifke/Mersin odaklı, kısmi Türkiye)
const LAT = { min: 35.7, max: 37.5 };
const LNG = { min: 31.5, max: 36.2 };

function project(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG.min) / (LNG.max - LNG.min)) * SVG_W;
  const y = SVG_H - ((lat - LAT.min) / (LAT.max - LAT.min)) * SVG_H;
  return [Math.round(x), Math.round(y)];
}

export default function CityMapChart({ data, title = "Şehir Haritası" }: Props) {
  if (!data.length) {
    return (
      <div className="bg-[#F6F6FB] rounded-xl p-8 flex flex-col items-center justify-center h-48">
        <span className="material-symbols-outlined text-4xl text-[#9AA3B2] mb-2">map</span>
        <p className="text-sm text-[#9AA3B2]">Harita verisi yok.</p>
      </div>
    );
  }

  const maxScans = Math.max(...data.map((d) => d.scans), 1);

  // Koordinatı bilinen şehirleri filtrele
  const plotted = data
    .map((d) => {
      const coords = CITY_COORDS[d.city];
      if (!coords) return null;
      const [x, y] = project(coords[0], coords[1]);
      // SVG sınırları dışına çıkan noktaları atla
      if (x < 0 || x > SVG_W || y < 0 || y > SVG_H) return null;
      const radius = 6 + (d.scans / maxScans) * 16;
      return { ...d, x, y, radius };
    })
    .filter(Boolean) as Array<CityData & { x: number; y: number; radius: number }>;

  // Koordinatsız şehirler için fallback bar listesi
  const unlisted = data.filter((d) => !CITY_COORDS[d.city]);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-6 flex flex-col h-full border border-[var(--border)]">
      <div className="mb-4">
        <span className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] rounded-sm text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
          Coğrafi Analiz
        </span>
        <h3 className="text-base font-bold text-[var(--text-1)]">{title}</h3>
        <p className="text-xs text-[var(--text-2)] mt-1">Silifke / Mersin bölgesi</p>
      </div>

      {plotted.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
          <span className="material-symbols-outlined text-3xl text-[#9AA3B2] mb-2">location_off</span>
          <p className="text-xs text-[#9AA3B2]">Bu periyotta harita verisi yok.</p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full rounded-lg"
          style={{ background: "#EEF2FF", maxHeight: 200 }}
          aria-label="Şehir bazlı tarama haritası"
        >
          {/* Izgara çizgileri */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={`vl-${f}`}
              x1={f * SVG_W} y1={0} x2={f * SVG_W} y2={SVG_H}
              stroke="#C7D2FE" strokeWidth={1} strokeDasharray="4 4"
            />
          ))}
          {[0.33, 0.66].map((f) => (
            <line
              key={`hl-${f}`}
              x1={0} y1={f * SVG_H} x2={SVG_W} y2={f * SVG_H}
              stroke="#C7D2FE" strokeWidth={1} strokeDasharray="4 4"
            />
          ))}

          {plotted.map((p) => (
            <g key={p.city}>
              {/* Pulse halkası */}
              <circle cx={p.x} cy={p.y} r={p.radius + 5} fill="#7C6CF6" fillOpacity={0.1} />
              {/* Ana daire */}
              <circle cx={p.x} cy={p.y} r={p.radius} fill="#7C6CF6" fillOpacity={0.85} />
              {/* Şehir adı */}
              <text
                x={p.x}
                y={p.y - p.radius - 5}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill="#1F2430"
              >
                {p.city}
              </text>
              {/* Tarama sayısı */}
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={8}
                fontWeight={800}
                fill="white"
              >
                {p.scans}
              </text>
            </g>
          ))}
        </svg>
      )}

      {/* Koordinatsız şehirler için mini liste */}
      {unlisted.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {unlisted.map((d) => (
            <div key={d.city} className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 border border-[#E9E9F2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C6CF6]" />
              <span className="text-[10px] font-bold text-[var(--text-2)]">{d.city}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{d.scans}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
