import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface ShopToolbarProps {
  categories: Category[];
  currentCategory?: string;
  currentSearch?: string;
}

function buildShopUrl(params: { category?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  const q = searchParams.toString();
  return q ? `/shop?${q}` : "/shop";
}

export function ShopToolbar({
  categories,
  currentCategory,
  currentSearch,
}: ShopToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
      {/* Búsqueda: solo borde inferior */}
      <form
        action="/shop"
        method="get"
        className="flex-1 w-full sm:max-w-md"
      >
        {currentCategory && (
          <input
            type="hidden"
            name="category"
            value={currentCategory}
          />
        )}
        <input
          type="text"
          name="search"
          defaultValue={currentSearch}
          placeholder="Buscar..."
          aria-label="Buscar productos"
          className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors"
        />
      </form>

      {/* Categorías: pills con indicador activo */}
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href={buildShopUrl({ search: currentSearch })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
            !currentCategory
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {!currentCategory && (
            <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
          )}
          Todas
        </Link>
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={buildShopUrl({ category: cat.id, search: currentSearch })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
              )}
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
