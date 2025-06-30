import { cn } from "@/shared/lib/css/tailwind";
import type { BankAccount } from "../model/bank-account";
import { BankAccountCard } from "../ui/bank-account-card";

interface BankAccountsListProps {
  accounts: BankAccount[];
  className?: string;
  onAccountClick?: (account: BankAccount) => void;
}

export function BankAccountsList({
  accounts,
  className,
  onAccountClick,
}: BankAccountsListProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 w-full", className)}>
      {accounts.map((account) => (
        <BankAccountCard
          key={account.id}
          account={account}
          onClick={() => onAccountClick?.(account)}
        />
      ))}
    </div>
  );
} 