import { useEffect, useState } from 'react';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types/category';

const SORT_OPTIONS = ['Most Downloaded', 'Latest'];

interface AssetFiltersProps {
  category: string;
  sort: string;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: string) => void;
}

export default function AssetFilters({ category, sort, onCategoryChange, onSortChange }: AssetFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesData = await categoryService.getActiveCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="flex gap-4 mb-6">
      <select
        className="border rounded px-3 py-2"
        value={category}
        onChange={e => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
      <select
        className="border rounded px-3 py-2"
        value={sort}
        onChange={e => onSortChange(e.target.value)}
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
} 