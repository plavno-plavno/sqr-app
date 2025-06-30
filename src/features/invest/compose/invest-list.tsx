import { cn } from "@/shared/lib/css/tailwind";
import type { Investment } from "../model/investment";
import { InvestCard } from "../ui/invest-card";

interface InvestListProps {
  investments: Investment[];
  className?: string;
  onInvestmentClick?: (investment: Investment) => void;
}

export function InvestList({
  investments,
  className,
  onInvestmentClick,
}: InvestListProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {investments.map((investment) => (
        <InvestCard
          key={investment.id}
          investment={investment}
          onClick={() => onInvestmentClick?.(investment)}
        />
      ))}
    </div>
  );
}
