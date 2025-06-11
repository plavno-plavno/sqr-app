import { cn } from "@/shared/lib/css/tailwind";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/kit/carousel";
import { type QuickAction } from "../model/action";
import { ActionCard } from "../ui/action-card";

interface ActionsCarouselProps {
  actions: QuickAction[];
  className?: string;
  onCardClick: (action: QuickAction) => void;
}

export function ActionsCarousel({
  actions,
  className,
  onCardClick,
}: ActionsCarouselProps) {
  return (
    <div className={cn("w-[calc(100%_+_20px)] overflow-hidden", className)}>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2">
          {actions.map((action) => (
            <CarouselItem className="basis-2/5 pl-2" key={action.id}>
              <ActionCard action={action} onClick={() => onCardClick(action)} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
