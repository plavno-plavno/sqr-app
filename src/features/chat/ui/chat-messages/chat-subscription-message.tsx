import { cn } from "@/shared/lib/css/tailwind";
import { Button } from "@/shared/ui/kit/button";

interface ChatMoneySubscriptionMessageProps {
  title: string;
  amount: string;
  period: string;
  className?: string;
  onDeactivate?: () => void;
}

export function ChatMoneySubscriptionMessage({
  title,
  amount,
  period,
  onDeactivate,
  className,
}: ChatMoneySubscriptionMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-4xl py-6 px-8 gap-2 bg-chat-card",
        className
      )}
    >
      <p className="text-xl">{title}</p>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-semibold">{amount}</p>
          <p className="text-sm font-medium text-primary-foreground">{period}</p>
        </div>
        <Button onClick={onDeactivate}>
          Deactivate
        </Button>
      </div>
    </div>
  );
}
