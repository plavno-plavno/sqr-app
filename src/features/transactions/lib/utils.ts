import { formatDateForGroup } from "@/shared/lib/js/date-utils";
import type { Transaction, TransactionGroup } from "../model/transaction";

export function groupTransactions(
  transactions: Transaction[]
): TransactionGroup[] {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupsMap = new Map<string, TransactionGroup>();

  for (const transaction of sortedTransactions) {
    const dateLabel = formatDateForGroup(new Date(transaction.date));
    const existingGroup = groupsMap.get(dateLabel);

    if (existingGroup) {
      existingGroup.transactions.push(transaction);
    } else {
      groupsMap.set(dateLabel, {
        id: dateLabel.toLowerCase().replace(/\s+/g, "-"),
        date: dateLabel,
        transactions: [transaction],
      });
    }
  }

  return Array.from(groupsMap.values());
}
