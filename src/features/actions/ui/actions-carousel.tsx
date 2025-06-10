import { cn } from "@/shared/lib/css/tailwind";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/kit/carousel";
import { type Action } from "../model/action";
import { ActionCard } from "./action-card";

interface ActionsCarouselProps {
  actions: Action[];
  className?: string;
}

export function ActionsCarousel({ actions, className }: ActionsCarouselProps) {
  return (
    <div className={cn("w-screen -mx-5", className)}>
      <Carousel className="w-full ml-5 max-w-[calc(100vw_-_20px)]">
        <CarouselContent className="-ml-2">
          {actions.map((action) => (
            <CarouselItem className="basis-2/5 pl-2" key={action.id}>
              <ActionCard action={action} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
