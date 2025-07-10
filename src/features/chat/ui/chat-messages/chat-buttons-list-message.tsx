import { cn } from "@/shared/lib/css/tailwind";
import { Button } from "@/shared/ui/kit/button";

interface ChatButtonsListProps<T extends { id: string; name: string }> {
  list: T[];
  className?: string;
  onItemClick?: (item: T) => void;
}

export function ChatButtonsList<T extends { id: string; name: string }>({
  list,
  className,
  onItemClick,
}: ChatButtonsListProps<T>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {list?.map((item) => (
        <Button
          variant="secondary"
          key={item?.id}
          className="w-full py-4 bg-background shadow-none justify-center"
          onClick={() => onItemClick?.(item)}
        >
          {item?.name}
        </Button>
      ))}
    </div>
  );
}
