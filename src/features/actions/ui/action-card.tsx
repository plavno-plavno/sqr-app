import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import type { QuickAction } from "../model/action";

interface ActionCardProps {
  action: QuickAction;
  className?: string;
  onClick?: (action: QuickAction) => void;
}

export function ActionCard({ action, className, onClick }: ActionCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] items-center gap-2.5 bg-background rounded-xl py-2 px-2.5 cursor-pointer",
        className
      )}
      onClick={() => onClick?.(action)}
    >
      <IconWrapper radius="base" />

      <p className="text-xs text-foreground/50 font-medium">{action.name}</p>
    </div>
  );
}
