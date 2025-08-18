import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import { Switch } from "@/shared/ui/kit/switch";

interface SettingsSwitchItemProps {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SettingsSwitchItem({
  icon,
  title,
  checked,
  onCheckedChange,
  className,
}: SettingsSwitchItemProps) {
  return (
    <div
      className={cn("flex items-end justify-between gap-[14px]", className)}
    >
      <div className="flex items-center gap-[14px]">
        <IconWrapper className="rounded-lg">{icon}</IconWrapper>
        <span className="text-2xl font-medium text-muted-foreground">
          {title}
        </span>
      </div>

      <Switch size="lg" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
