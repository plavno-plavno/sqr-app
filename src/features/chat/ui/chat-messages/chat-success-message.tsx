import { cn } from "@/shared/lib/css/tailwind";
import CheckIcon from "@/shared/assets/icons/check-icon.svg?react";
import { IconWrapper } from "@/shared/ui/icon-wrapper";

interface ChatSuccessMessageProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export function ChatSuccessMessage({
  text,
  className,
  children,
}: ChatSuccessMessageProps) {
  return (
    <div className={cn("flex rounded-3xl p-5 gap-4 bg-chat-card", className)}>
      <IconWrapper className="w-7 h-7 bg-icon-wrapper-primary flex-none">
        <CheckIcon />
      </IconWrapper>
      <div className="flex flex-col gap-4">
        <p className="text-2xl text-agent-message-foreground whitespace-pre-wrap">{text}</p>
        {children}
      </div>
    </div>
  );
}
