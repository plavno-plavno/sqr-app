import { cn } from "@/shared/lib/css/tailwind";
import { ChatMessageRole, type ChatMessage } from "../../model/chat-store";

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
        "text-2xl break-all",
        (role === ChatMessageRole.USER_TEXT ||
          role === ChatMessageRole.USER_VOICE) &&
          "text-foreground font-medium",
        role === ChatMessageRole.AGENT && "text-agent-message-foreground",
        className
      )}
    >
      {text}
    </p>
  );
}
