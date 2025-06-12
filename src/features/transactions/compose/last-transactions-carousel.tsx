import { cn } from "@/shared/lib/css/tailwind";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/kit/carousel";
import { type Transaction } from "../model/transaction";
import { TransactionCard } from "../ui/transaction-card";

interface LastTransactionsCarouselProps {
  transactions: Transaction[];
  className?: string;
}

export function LastTransactionsCarousel({
  transactions,
  className,
}: LastTransactionsCarouselProps) {
  return (
    <div className={cn("w-[calc(100%_+_20px)] overflow-hidden", className)}>
      <Carousel className="w-full">
        <CarouselContent className="-ml-[11px]">
          {transactions.map((transaction) => (
            <CarouselItem className="basis-2/3 pl-[11px]" key={transaction.id}>
              <TransactionCard transaction={transaction} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
