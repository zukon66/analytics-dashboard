import { SkeletonKPICard, SkeletonBlock, SkeletonTableRow, SkeletonChartBar } from "@/components/SkeletonBlock";

export default function HomeLoading() {
  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded" />
          <SkeletonBlock className="h-9 w-72 rounded-lg" />
          <SkeletonBlock className="h-4 w-52 rounded" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-full" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonKPICard key={i} />)}
      </div>

      {/* Büyüme özeti */}
      <SkeletonBlock className="h-28 w-full mb-8" />

      {/* İki kolon */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sol: tablo */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-[#E9E9F2] overflow-hidden">
          <div className="px-8 py-6 border-b border-[#E9E9F2]">
            <SkeletonBlock className="h-5 w-40 rounded" />
          </div>
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)}
            </tbody>
          </table>
        </div>

        {/* Sağ: churn listesi */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-[#E9E9F2] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E9E9F2]">
            <SkeletonBlock className="h-5 w-32 rounded" />
          </div>
          <div className="divide-y divide-[#E9E9F2]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-32 rounded" />
                  <SkeletonBlock className="h-3 w-24 rounded" />
                </div>
                <SkeletonBlock className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart alanı */}
      <div className="mt-8 bg-white rounded-xl p-8 border border-[#E9E9F2]">
        <div className="flex justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-7 w-48 rounded-lg" />
          </div>
          <SkeletonBlock className="h-12 w-20 rounded-lg" />
        </div>
        <SkeletonChartBar />
      </div>
    </main>
  );
}
