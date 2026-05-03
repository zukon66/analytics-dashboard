import { SkeletonBlock, SkeletonAreaChart, SkeletonTableRow } from "@/components/SkeletonBlock";

export default function GrowthLoading() {
  return (
    <main className="kok-page pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded" />
          <SkeletonBlock className="h-9 w-64 rounded-lg" />
          <SkeletonBlock className="h-4 w-48 rounded" />
        </div>
        <SkeletonBlock className="h-6 w-24 rounded" />
      </div>

      {/* MRR Trend chart */}
      <div className="kok-card rounded-3xl p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-8 w-56 rounded-lg" />
            <SkeletonBlock className="h-4 w-40 rounded" />
          </div>
          <SkeletonBlock className="h-16 w-28 rounded-xl" />
        </div>
        <SkeletonAreaChart />
        {/* Plan pill'leri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Satır 2: Trial + Aktivasyon */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-7 kok-card rounded-3xl overflow-hidden min-h-[340px]">
          <div className="px-6 py-5 border-b border-[#E9E9F2]">
            <SkeletonBlock className="h-5 w-40 rounded" />
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-5 kok-card rounded-3xl min-h-[340px] p-6">
          <SkeletonBlock className="h-5 w-36 rounded mb-6" />
          <div className="space-y-4">
            {[80, 55, 30].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-24 rounded" />
                <SkeletonBlock className={`h-8 rounded-lg`} style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satır 3: Yeni kayıtlar + Rapor */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 kok-card rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E9E9F2]">
            <SkeletonBlock className="h-5 w-36 rounded" />
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-12 lg:col-span-4 kok-card rounded-3xl p-6 space-y-4">
          <SkeletonBlock className="h-5 w-32 rounded" />
          <SkeletonBlock className="h-24 rounded-xl" />
          <SkeletonBlock className="h-12 rounded-xl" />
          <SkeletonBlock className="h-12 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
