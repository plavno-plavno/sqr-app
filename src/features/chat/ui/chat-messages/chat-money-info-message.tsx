import { cn } from "@/shared/lib/css/tailwind";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

interface ChatMoneyInfoMessageProps {
  title: string;
  amount: string;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function ChatMoneyInfoMessage({
  title,
  amount,
  trend,
  className,
}: ChatMoneyInfoMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-4xl py-5.5 px-8 gap-0.5 bg-chat-card",
        className
      )}
    >
      <div className="flex justify-between gap-2">
        <p className="text-sm font-medium text-primary-foreground">{title}</p>
        {trend === "up" && <ArrowBigUp />}
        {trend === "down" && <ArrowBigDown />}
      </div>

      <p className="text-2xl font-semibold">${amount}</p>
    </div>
  );
}
