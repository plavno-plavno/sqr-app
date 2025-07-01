import { cn } from "@/shared/lib/css/tailwind";
import type { InvestSummary } from "../model/investment";
import ArrowUpIcon from "@/shared/assets/icons/arrow-up-icon.svg?react";
import { formatNumber } from "@/shared/lib/js/numbers";

interface InvestSummaryCardProps {
  summary: InvestSummary;
  className?: string;
}

export function InvestSummaryCard({
  summary,
  className,
}: InvestSummaryCardProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <p className="text-sm font-semibold text-foreground/50">
        Total investments
      </p>
      <p className="text-[32px] font-semibold text-foreground">
        ${summary.amount}
      </p>
      
      <div className="flex items-center gap-1.5 bg-primary-light rounded-full px-2.5 py-1">
        <ArrowUpIcon />
        <span className="text-sm font-semibold text-foreground">
          ${formatNumber(summary.change, 2)}
        </span>
      </div>
    </div>
  );
} 