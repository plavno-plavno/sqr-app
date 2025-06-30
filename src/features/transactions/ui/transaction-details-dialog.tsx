import ImageFallbackIcon from "@/shared/assets/icons/image-fallback-icon.svg?react";
import { AdaptiveDrawer } from "@/shared/ui/adaptive-drawer";
import { Button } from "@/shared/ui/kit/button";
import type { Transaction } from "../model/transaction";

interface TransactionDetailsProps {
  open: boolean;
  transaction: Transaction;
  onOpenChange: (open: boolean) => void;
}

function TransactionDetails({
  transaction,
  onOpenChange,
}: {
  transaction: Transaction;
  onOpenChange: (open: boolean) => void;
}) {
  const { amount, date, username, details } = transaction;

  return (
    <div className="flex flex-col gap-8 my-7.5">
      <div>
        <h3 className="text-[32px] font-semibold">-${amount}</h3>
        <p className="flex gap-1.5 items-center text-xs text-foreground/50 font-medium">
          {date.toLocaleDateString()}
          <span className="w-[5px] h-[5px] bg-dot rounded-full" />
          {date.toLocaleTimeString()}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {details.map(({ name, value }) => (
          <div
            key={name}
            className="flex items-center justify-between bg-background rounded-[14px] p-4"
          >
            <p className="text-base font-medium">{name}</p>
            <div className="text-end">
              {name === "Recipient" && <p className="font-bold">{username}</p>}

              {name !== "Card" && (
                <p className="text-base font-light">{value}</p>
              )}

              {name === "Card" && (
                <div className="flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 bg-accent rounded-full">
                    <ImageFallbackIcon width={8} height={8} />
                  </span>
                  <span className="text-sm font-semibold">
                    Credit card ****{value.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="lg" className="flex-1">
          Download report
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export function TransactionDetailsDialog({
  open,
  transaction,
  onOpenChange,
}: TransactionDetailsProps) {
  return (
    <AdaptiveDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Transaction details"
    >
      <TransactionDetails
        transaction={transaction}
        onOpenChange={onOpenChange}
      />
    </AdaptiveDrawer>
  );
}
