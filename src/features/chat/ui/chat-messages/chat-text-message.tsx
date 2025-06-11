import { cn } from "@/shared/lib/css/tailwind";
import { type ChatMessage } from "../../model/chat-store";

interface ChatTextMessageProps {
  text: string;
  role: ChatMessage["role"];
  className?: string;
}

export function ChatTextMessage({
  text,
  role,
  className,
}: ChatTextMessageProps) {
  return (
    <p
      className={cn(
        "text-2xl",
        role === "user" && "text-foreground font-medium",
        role === "agent" && "text-agent-message-foreground",
        className
      )}
    >
      {text}
    </p>
  );
}
