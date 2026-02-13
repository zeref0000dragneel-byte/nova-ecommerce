"use client";

import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
}

export default function CategoryFilter({
  categories,
  currentCategory,
}: CategoryFilterProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/shop?category=${value}`);
    } else {
      router.push("/shop");
    }
  };

  return (
    <select
      value={currentCategory || ""}
      onChange={handleChange}
      className="px-4 py-2.5 border border-border rounded-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
    >
      <option value="">Todas las categorías</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}