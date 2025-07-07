import { cn } from "@/shared/lib/css/tailwind";
import { Carousel, CarouselContent } from "@/shared/ui/kit/carousel";

export function ShiftedCarousel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-[calc(100%_+_20px)] overflow-hidden", className)}>
      <Carousel className="w-full">
        <CarouselContent className="-ml-[11px]">{children}</CarouselContent>
      </Carousel>
    </div>
  );
}
