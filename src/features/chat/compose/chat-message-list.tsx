import { cn } from "@/shared/lib/css/tailwind";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { useChatStore } from "../model/chat-store";
import { ChatMessage } from "./chat-message";

export function ChatMessageList({ className }: { className?: string }) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const chats = useChatStore.use.chats();
  const messages = chats[chatId as string]?.messages;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {messages?.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
