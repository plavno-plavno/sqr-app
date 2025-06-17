import { cn } from "@/shared/lib/css/tailwind";

interface ChatMoneyInfoMessageProps {
  description: string;
  amount: string;
  category?: string;
  className?: string;
}

export function ChatMoneyInfoMessage({
  description,
  amount,
  category,
  className,
}: ChatMoneyInfoMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-4xl py-5.5 px-8 gap-0.5 bg-chat-card",
        className
      )}
    >
      <div className="flex justify-between items-center gap-2">
        <p className="text-sm font-medium text-primary-foreground">{description}</p>
        {category && <p className="text-sm font-semibold text-primary-foreground">{category}</p>}
      </div>

      <p className="text-2xl font-semibold">${amount}</p>
    </div>
  );
}
