import { Category } from '@/types/pos';
import { cn } from '@/lib/utils';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'category-btn whitespace-nowrap',
            selectedCategory === category.id && 'category-btn-active'
          )}
        >
          <span className="text-2xl">{category.emoji}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
