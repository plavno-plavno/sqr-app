import { cn } from "@/shared/lib/css/tailwind";

interface Info {
  title: string;
  description: string;
  message: string;
}

interface ChatInfoListMessageProps {
  list: Info[];
  className?: string;
  onItemClick?: (item: Info) => void;
}

export function ChatInfoListMessage({
  list,
  className,
  onItemClick,
}: ChatInfoListMessageProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {list.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-1 bg-background rounded-3xl py-5.5 px-8"
          onClick={() => onItemClick?.(item)}
        >
          <p className="text-lg font-semibold">{item.title}</p>
          <p className="text-base font-medium text-primary-foreground">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
