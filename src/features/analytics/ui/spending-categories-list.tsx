import { cn } from "@/shared/lib/css/tailwind";
import type { SpendingCategory } from "../model/analytics";

interface CategoryCardProps {
  category: SpendingCategory;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="bg-background rounded-xl p-4 flex items-center gap-2.5">
      {/* Category icon placeholder */}
      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0"></div>

      {/* Category info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-px">
          <p className="text-base font-semibold text-foreground">
            {category.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {category.transactions}
          </p>
        </div>
      </div>

      {/* Amount and percentage */}
      <div className="flex flex-col items-end gap-px">
        <p className="text-base font-semibold text-foreground">
          {category.amount}
        </p>
        <p className="text-xs text-muted-foreground">{category.percentage}</p>
      </div>
    </div>
  );
}

interface SpendingCategoriesListProps {
  categories: SpendingCategory[];
  className?: string;
}

export function SpendingCategoriesList({
  categories,
  className,
}: SpendingCategoriesListProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
