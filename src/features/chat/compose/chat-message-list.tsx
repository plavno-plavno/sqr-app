import { cn } from "@/shared/lib/css/tailwind";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { useChatStore } from "../model/chat-store";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import { useEffect, useRef } from "react";

export function ChatMessageList({ className }: { className?: string }) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const chats = useChatStore.use.chats();
  const messages = chats[chatId as string]?.messages;

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message is added or resized
  useEffect(() => {
    if (!messagesContainerRef.current || !scrollAreaRef.current) return;

    const scrollToBottom = () => {
      const scrollElement = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );

      if (scrollElement) scrollElement.scrollTop = scrollElement.scrollHeight;
    };

    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(messagesContainerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <ScrollArea ref={scrollAreaRef} className="min-h-0 pr-3.5 -mr-3.5">
      <div
        ref={messagesContainerRef}
        className={cn("flex flex-col gap-4", className)}
      >
        {messages?.map((message) => (
          <div id={message.id} key={message.id}>
            <ChatMessage message={message} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
