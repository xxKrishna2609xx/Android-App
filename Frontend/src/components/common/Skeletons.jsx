// Skeleton Loaders for various UI elements

export const BusinessCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 rounded-xl skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
      </div>
    </div>
    <div className="h-3 skeleton rounded-lg w-full" />
    <div className="h-3 skeleton rounded-lg w-4/5" />
    <div className="flex justify-between">
      <div className="h-3 skeleton rounded-lg w-1/3" />
      <div className="h-3 skeleton rounded-lg w-1/4" />
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-9 skeleton rounded-xl" />
      <div className="w-10 h-9 skeleton rounded-xl" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center space-y-3">
    <div className="w-14 h-14 skeleton rounded-2xl mx-auto" />
    <div className="h-4 skeleton rounded-lg w-3/4 mx-auto" />
    <div className="h-3 skeleton rounded-lg w-1/2 mx-auto" />
  </div>
);

export const PageBannerSkeleton = () => (
  <div className="h-48 skeleton rounded-2xl w-full" />
);

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 skeleton rounded-lg ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);
