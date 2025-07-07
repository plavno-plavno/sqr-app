import { CarouselItem } from "@/shared/ui/kit/carousel";
import { ShiftedCarousel } from "@/shared/ui/shifted-carousel";
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
    <ShiftedCarousel className={className}>
      {actions.map((action) => (
        <CarouselItem className="basis-2/5 pl-2" key={action.id}>
          <ActionCard action={action} onClick={() => onCardClick(action)} />
        </CarouselItem>
      ))}
    </ShiftedCarousel>
  );
}
