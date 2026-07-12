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
