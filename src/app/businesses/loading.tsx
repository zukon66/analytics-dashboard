import { SkeletonBlock, SkeletonTableRow } from "@/components/SkeletonBlock";

export default function BusinessesLoading() {
  return (
    <main className="kok-page pt-24 pb-12 px-4 md:px-8 min-h-screen">
      {/* Başlık */}
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded" />
          <SkeletonBlock className="h-9 w-56 rounded-lg" />
          <SkeletonBlock className="h-4 w-44 rounded" />
        </div>
        <SkeletonBlock className="h-10 w-40 rounded-full" />
      </div>

      {/* Arama + filtre bar */}
      <div className="flex gap-3 mb-6">
        <SkeletonBlock className="h-11 flex-1 rounded-xl" />
        <SkeletonBlock className="h-11 w-36 rounded-xl" />
        <SkeletonBlock className="h-11 w-36 rounded-xl" />
      </div>

      {/* Tablo */}
      <div className="kok-card rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 px-6 py-4 border-b border-[#E9E9F2] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-3 rounded" />
          ))}
        </div>
        {/* Satırlar */}
        <table className="w-full">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
