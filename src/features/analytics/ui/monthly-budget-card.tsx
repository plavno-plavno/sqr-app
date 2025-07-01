import { cn } from "@/shared/lib/css/tailwind";
import type { MonthlyBudget } from "../model/analytics";

interface CircularProgressProps {
  progress: number;
  className?: string;
}

function CircularProgress({ progress, className }: CircularProgressProps) {
  // Calculate stroke-dasharray and stroke-dashoffset for circular progress
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <svg className="w-10 h-10 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          className="text-primary-light"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-secondary transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  );
}

interface MonthlyBudgetCardProps {
  budget: MonthlyBudget;
  className?: string;
}

export function MonthlyBudgetCard({
  budget,
  className,
}: MonthlyBudgetCardProps) {
  return (
    <div
      className={cn(
        "bg-background rounded-xl p-4 flex items-center gap-2.5",
        className
      )}
    >
      {/* Progress circle */}
      <CircularProgress progress={budget.progress} />

      {/* Budget info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-px">
          <p className="text-base font-semibold text-foreground">{budget.title}</p>
          <p className="text-xs text-muted-foreground">{budget.dailyLimit}</p>
        </div>
      </div>

      {/* Amount info */}
      <div className="flex flex-col items-end gap-px">
        <p className="text-base font-semibold text-foreground">{budget.remaining}</p>
        <p className="text-xs text-muted-foreground">{budget.total}</p>
      </div>
    </div>
  );
} 