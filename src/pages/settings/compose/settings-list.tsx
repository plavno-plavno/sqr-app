import {
  SettingsItem,
  type SettingsItemType
} from "@/features/settings";
import { cn } from "@/shared/lib/css/tailwind";


interface SettingsListProps {
  items: SettingsItemType[];
  className?: string;
  onItemClick?: (item: SettingsItemType) => void;
}

export function SettingsList({
  items,
  className,
  onItemClick,
}: SettingsListProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {items.map((item) => (
        <SettingsItem
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
