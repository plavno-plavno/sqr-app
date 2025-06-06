import { cn } from "@/shared/lib/css/tailwind";
import type { Action } from "../model/action";
import { ImageFallbackIcon } from "@/shared/ui/icons/ImageFallbackIcon";

interface ActionCardProps {
  action: Action;
  className?: string;
}

export function ActionCard({ action, className }: ActionCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 bg-background rounded-xl py-2 px-2.5",
        className
      )}
    >
      <div className="grid place-items-center w-8 h-8 bg-primary rounded-[10px]">
        <ImageFallbackIcon />
      </div>

      <p className="text-xs text-foreground/50 font-medium">{action.name}</p>
    </div>
  );
}
