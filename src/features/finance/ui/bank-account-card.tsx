import { cn } from "@/shared/lib/css/tailwind";
import type { BankAccount } from "../model/bank-account";
import { formatBalance } from "@/shared/lib/js/numbers";

interface BankAccountCardProps {
  account: BankAccount;
  className?: string;
  onClick?: () => void;
}

export function BankAccountCard({
  account,
  className,
  onClick,
}: BankAccountCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-background rounded-[14px] p-4 w-full",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-[1px]">
        <p className="text-xs font-medium text-foreground/50">{account.name}</p>
        <p className="text-base font-semibold text-foreground">
          ${formatBalance(account.balance)}
        </p>
      </div>

      <div className="flex p-1 items-end justify-between bg-dot rounded-[7px] w-[49px] h-[34px]">
        <p className="text-[10px] font-semibold text-foreground">
          {account.cardNumber}
        </p>

        <div className="flex">
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full -ml-1" />
        </div>
      </div>
    </div>
  );
}
