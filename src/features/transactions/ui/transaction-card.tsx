import { cn } from "@/shared/lib/css/tailwind";
import type { Transaction } from "../model/transaction";

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
}

export function TransactionCard({
  transaction,
  className,
}: TransactionCardProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center w-full bg-background rounded-xl p-4",
        className
      )}
    >
      <div>
        <p className="flex gap-1.5 items-center text-xs text-foreground/50 font-medium">
          {transaction.date.toLocaleDateString()}
          <span className="w-[5px] h-[5px] bg-dot rounded-full" />
          {transaction.date.toLocaleTimeString()}
        </p>
        <p className="text-base font-semibold">{transaction.username}</p>
      </div>

      <span className="text-2xl font-semibold">-{transaction.amount}$</span>
    </div>
  );
}
