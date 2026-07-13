interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder block. Compose several to mirror real content layout. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`skeleton rounded-md ${className}`} />;
}

/** Card-shaped placeholder matching ProductCard's footprint. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-cream-200 bg-white">
      <Skeleton className="aspect-[280/170] rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Page heading plus content blocks for detail and confirmation screens. */
export function DetailPageSkeleton({ split = false }: { split?: boolean }) {
  return (
    <div className="animate-fade-in" role="status" aria-label="Loading content" aria-busy="true">
      <span className="sr-only">Loading content</span>
      <Skeleton className="mb-6 h-4 w-32" />
      <div className={`grid gap-8 ${split ? "lg:grid-cols-2" : "max-w-3xl"}`}>
        {split && <Skeleton className="aspect-[4/3] rounded-2xl" />}
        <div className="rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-4/5" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-8 h-14 w-full" />
          <Skeleton className="mt-4 h-12 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/** Heading, summary cards, and rows for admin dashboards and data tables. */
export function DataPageSkeleton() {
  return (
    <div className="animate-fade-in" role="status" aria-label="Loading data" aria-busy="true">
      <span className="sr-only">Loading data</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}
      </div>
      <div className="mt-7 overflow-hidden rounded-xl border border-cream-200 bg-white p-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center justify-between gap-5 border-b border-cream-200 py-4 last:border-0">
            <div className="flex-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-2 h-3 w-1/3" /></div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
