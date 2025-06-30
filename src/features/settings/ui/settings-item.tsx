import { cn } from "@/shared/lib/css/tailwind";
import type { SettingsItemType } from "../model/settings";
import { IconWrapper } from "@/shared/ui/icon-wrapper";

interface SettingsItemProps {
  item: SettingsItemType;
  className?: string;
  onClick?: () => void;
}

export function SettingsItem({ item, className, onClick }: SettingsItemProps) {
  return (
    <div
      className={cn("flex items-center gap-[14px] cursor-pointer", className)}
      onClick={() => {
        onClick?.();
      }}
    >
      <IconWrapper className="rounded-lg">{item.icon}</IconWrapper>

      <span className="text-2xl font-medium text-muted-foreground">
        {item.title}
      </span>
    </div>
  );
}
