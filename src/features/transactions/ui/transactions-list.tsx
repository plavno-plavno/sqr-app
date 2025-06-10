import { cn } from "@/shared/lib/css/tailwind";
import { useMemo, useState } from "react";
import { groupTransactions } from "../lib/utils";
import type { Transaction } from "../model/transaction";
import { TransactionCard } from "./transaction-card";
import { TransactionDetailsDialog } from "./transaction-details-dialog";

interface TransactionsListProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionsList({
  transactions,
  className,
}: TransactionsListProps) {
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const groupedTransactions = useMemo(
    () => groupTransactions(transactions),
    [transactions]
  );

  const handleCardClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  return (
    <div className={cn("flex flex-col gap-8 mt-8", className)}>
      {groupedTransactions.map((group) => (
        <div key={group.id} className="flex flex-col gap-3.5">
          <h3 className="text-xs font-semibold text-black/50">
            {group.date.toUpperCase()}
          </h3>
          <div className="flex flex-col gap-1.5">
            {group.transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onClick={() => handleCardClick(transaction)}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedTransaction && (
        <TransactionDetailsDialog
          open={open}
          transaction={selectedTransaction}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}
