import Header from "@/components/Header";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="h-10 w-full max-w-md bg-gray-100 animate-pulse rounded" />
        </div>

        <div className="pt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
