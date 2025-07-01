import { cn } from "@/shared/lib/css/tailwind";
import { PaymentMethod, type FinanceAccount } from "../model/finance-account";
import { formatBalance } from "@/shared/lib/js/numbers";

interface FinanceAccountCardProps {
  financeAccount: FinanceAccount;
  className?: string;
  onClick?: () => void;
}

export function FinanceAccountCard({
  financeAccount,
  className,
  onClick,
}: FinanceAccountCardProps) {
  const balance =
    financeAccount.type === PaymentMethod.CreditCard
      ? `$${formatBalance(financeAccount.balance)}`
      : `${financeAccount.balance} ${financeAccount.currency}`;

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
        <p className="text-xs font-medium text-foreground/50">{financeAccount.name}</p>
        <p className="text-base font-semibold text-foreground">{balance}</p>
      </div>

      {financeAccount.type === PaymentMethod.CreditCard && (
        <div className="flex p-1 items-end justify-between bg-dot rounded-[7px] w-[49px] h-[34px]">
          <p className="text-[10px] font-semibold text-foreground">
            {financeAccount.identifier.slice(-4)}
          </p>

          <div className="flex">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full -ml-1" />
          </div>
        </div>
      )}

      {financeAccount.type === PaymentMethod.Crypto && (
        <div className="text-[10px] font-semibold text-foreground bg-dot rounded-[7px] p-1.5">
          {financeAccount.identifier.slice(-4)}...{financeAccount.identifier.slice(0, 4)}
        </div>
      )}
    </div>
  );
} 