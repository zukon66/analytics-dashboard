import { SkeletonKPICard, SkeletonBlock, SkeletonChartBar } from "@/components/SkeletonBlock";

export default function AnalyticsLoading() {
  return (
    <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#FAFAFD]">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-9 w-64 rounded-lg" />
          <SkeletonBlock className="h-4 w-48 rounded" />
        </div>
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 w-48 rounded-full" />
          <SkeletonBlock className="h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* KPI Şeridi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}
      </div>

      {/* Saatlik chart */}
      <div className="bg-white rounded-xl p-8 border border-[#E9E9F2] mb-8">
        <div className="flex justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-7 w-48 rounded-lg" />
            <SkeletonBlock className="h-4 w-56 rounded" />
          </div>
          <SkeletonBlock className="h-14 w-20 rounded-lg" />
        </div>
        <SkeletonChartBar />
      </div>

      {/* Alt iki kolon */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-[#E9E9F2] p-6">
          <SkeletonBlock className="h-5 w-36 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-24 rounded" />
                <SkeletonBlock className="h-4 flex-1 rounded" style={{ opacity: 1 - i * 0.12 }} />
                <SkeletonBlock className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-[#E9E9F2] p-6">
          <SkeletonBlock className="h-5 w-32 rounded mb-4" />
          <div className="flex items-center justify-center h-40">
            <SkeletonBlock className="w-40 h-40 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
