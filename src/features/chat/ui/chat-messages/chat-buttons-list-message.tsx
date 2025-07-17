import { cn } from "@/shared/lib/css/tailwind";
import { Button } from "@/shared/ui/kit/button";

interface ChatButtonsListProps<T extends { id: string; name: string }> {
  list: T[];
  disabled?: boolean;
  className?: string;
  onItemClick?: (item: T) => void;
}

export function ChatButtonsList<T extends { id: string; name: string }>({
  list,
  disabled,
  className,
  onItemClick,
}: ChatButtonsListProps<T>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {list?.map((item) => (
        <Button
          variant="secondary"
          key={item?.id}
          disabled={disabled}
          className="w-full py-4 bg-background shadow-none justify-center"
          onClick={() => onItemClick?.(item)}
        >
          {item?.name}
        </Button>
      ))}
    </div>
  );
}
