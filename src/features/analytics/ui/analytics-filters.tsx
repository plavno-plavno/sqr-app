import { cn } from "@/shared/lib/css/tailwind";
import type { FilterType } from "../model/analytics";

interface AnalyticsFiltersProps {
  filters: FilterType[];
  className?: string;
}

export function AnalyticsFilters({
  filters,
  className,
}: AnalyticsFiltersProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {filters.map((filter) => {
        return (
          <div
            key={filter.id}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-primary-light rounded-full"
          >
            {filter.icon}
            <span className="text-sm font-semibold">{filter.label}</span>
          </div>
        );
      })}
    </div>
  );
}
