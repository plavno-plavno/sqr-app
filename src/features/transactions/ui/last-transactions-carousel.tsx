import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/kit/carousel";
import { lastTransactionsMock } from "../model/transaction";
import { TransactionCard } from "./transaction-card";
import { cn } from "@/shared/lib/css/tailwind";

interface LastTransactionsCarouselProps {
  className?: string;
}

export function LastTransactionsCarousel({
  className,
}: LastTransactionsCarouselProps) {
  return (
    <div className={cn("w-screen -mx-5", className)}>
      <Carousel className="w-full ml-5 max-w-[calc(100vw_-_20px)]">
        <CarouselContent className="-ml-[11px]">
          {lastTransactionsMock.map((transaction) => (
            <CarouselItem className="basis-2/3 pl-[11px]" key={transaction.id}>
              <TransactionCard transaction={transaction} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
