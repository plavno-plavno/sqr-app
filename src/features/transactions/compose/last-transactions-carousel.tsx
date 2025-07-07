import { ShiftedCarousel } from "@/shared/ui/shifted-carousel";
import { type Transaction } from "../model/transaction";
import { TransactionCard } from "../ui/transaction-card";
import { CarouselItem } from "@/shared/ui/kit/carousel";

interface LastTransactionsCarouselProps {
  transactions: Transaction[];
  className?: string;
}

export function LastTransactionsCarousel({
  transactions,
  className,
}: LastTransactionsCarouselProps) {
  return (
    <ShiftedCarousel className={className}>
      {transactions.map((transaction) => (
        <CarouselItem className="basis-2/3 pl-[11px]" key={transaction.id}>
          <TransactionCard transaction={transaction} />
        </CarouselItem>
      ))}
    </ShiftedCarousel>
  );
}
