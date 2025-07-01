import { cn } from "@/shared/lib/css/tailwind";
import type { FinanceAccount } from "../model/finance-account";
import { FinanceAccountCard } from "../ui/finance-account-card";

interface FinanceAccountsListProps {
  financeAccounts: FinanceAccount[];
  className?: string;
  onFinanceAccountClick?: (financeAccount: FinanceAccount) => void;
}

export function FinanceAccountsList({
  financeAccounts,
  className,
  onFinanceAccountClick,
}: FinanceAccountsListProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 w-full", className)}>
      {financeAccounts.map((financeAccount) => (
        <FinanceAccountCard
          key={financeAccount.id}
          financeAccount={financeAccount}
          onClick={() => onFinanceAccountClick?.(financeAccount)}
        />
      ))}
    </div>
  );
} 