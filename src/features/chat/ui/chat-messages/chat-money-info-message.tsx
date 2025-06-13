import { cn } from "@/shared/lib/css/tailwind";

interface ChatMoneyInfoMessageProps {
  title: string;
  amount: string;
  className?: string;
}

export function ChatMoneyInfoMessage({
  title,
  amount,
  className,
}: ChatMoneyInfoMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-4xl py-5.5 px-8 gap-0.5 bg-chat-card",
        className
      )}
    >
      <p className="text-sm font-medium text-primary-foreground">{title}</p>
      <p className="text-2xl font-semibold">{amount}</p>
    </div>
  );
}
