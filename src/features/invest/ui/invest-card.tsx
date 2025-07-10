import { cn } from "@/shared/lib/css/tailwind";
import { getInvestmentIcon, type Investment } from "../model/investment";
import { formatChangePercent, formatNumber } from "@/shared/lib/js/numbers";

interface InvestCardProps {
  investment: Investment;
  className?: string;
  onClick?: () => void;
}

export function InvestCard({
  investment,
  className,
  onClick,
}: InvestCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-background rounded-[14px] p-4 w-full",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
          {getInvestmentIcon(investment.symbol)}
        </div>
        <span className="text-base font-semibold text-foreground">
          {investment.name}
        </span>
      </div>

      <div className="flex flex-col items-end gap-[1px]">
        <p className="text-base font-semibold text-foreground">
          ${formatNumber(investment.amount * investment.rate, 2)}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground/50">
            {formatNumber(investment.amount, 2)} {investment.currency}
          </span>
          <div className="w-[5px] h-[5px] bg-dot rounded-full" />
          <span className="text-xs font-medium text-foreground/50">
            {formatChangePercent(investment.changePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}
