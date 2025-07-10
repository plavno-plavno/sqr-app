import { cn } from "@/shared/lib/css/tailwind";
import type { Transaction } from "../model/transaction";

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
  onClick?: () => void;
}

export function TransactionCard({
  transaction,
  className,
  onClick,
}: TransactionCardProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center w-full bg-background rounded-xl p-4",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div>
        <p className="flex gap-1.5 items-center text-xs text-foreground/50 font-medium">
          {new Date(transaction.date).toLocaleDateString()}
          <span className="w-[5px] h-[5px] bg-dot rounded-full" />
          {new Date(transaction.date).toLocaleTimeString()}
        </p>
        <p className="text-base font-semibold">
          {transaction.details.find((detail) => detail.name === "Recipient")
            ?.value}
        </p>
      </div>

      <span className="text-2xl font-semibold">-{transaction.amount}$</span>
    </div>
  );
}
