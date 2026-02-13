export default function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse rounded-sm" />
      <div className="pt-0 flex flex-col">
        <div className="min-h-[40px] mt-3 flex flex-col justify-center gap-2">
          <div className="h-3 bg-gray-100 animate-pulse rounded w-full max-w-[90%]" />
          <div className="h-3 bg-gray-100 animate-pulse rounded w-2/3" />
        </div>
        <div className="mt-1.5 h-3 bg-gray-100 animate-pulse rounded w-16" />
        <div className="mt-4 h-10 bg-gray-100 animate-pulse rounded-sm" />
      </div>
    </article>
  );
}
