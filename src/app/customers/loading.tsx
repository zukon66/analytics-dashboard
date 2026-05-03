import { SkeletonBlock, SkeletonKPICard, SkeletonTableRow } from "@/components/SkeletonBlock";

export default function CustomersLoading() {
  return (
    <main className="kok-page pt-24 pb-12 px-4 md:px-8 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-9 w-48 rounded-lg" />
          <SkeletonBlock className="h-4 w-40 rounded" />
        </div>
      </div>

      {/* KPI kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonKPICard key={i} />)}
      </div>

      {/* Arama */}
      <div className="flex gap-3 mb-6">
        <SkeletonBlock className="h-11 flex-1 rounded-xl" />
      </div>

      {/* Tablo */}
      <div className="kok-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E9E9F2]">
          <SkeletonBlock className="h-5 w-32 rounded" />
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={5} />
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E9E9F2] flex justify-between">
          <SkeletonBlock className="h-4 w-40 rounded" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-20 rounded-lg" />
            <SkeletonBlock className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
