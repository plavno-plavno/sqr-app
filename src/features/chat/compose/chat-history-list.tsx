import { href, Link } from "react-router-dom";
import { useChatStore } from "../model/chat-store";
import { ROUTES } from "@/shared/model/routes";

export function ChatHistoryCard({ text }: { text: string }) {
  return (
    <div className="bg-sidebar-primary rounded-xl px-5 py-4">
      <span className="font-semibold text-foreground">{text}</span>
    </div>
  );
}

export function ChatHistoryList({ onCardClick }: { onCardClick: () => void }) {
  const chats = useChatStore.use.chats();

  return (
    <div className="flex flex-col gap-2">
      {Object.values(chats).map((chat) => (
        <Link
          to={href(ROUTES.CHAT, { chatId: chat.id })}
          key={chat.id}
          onClick={onCardClick}
        >
          <ChatHistoryCard text={chat.title} />
        </Link>
      ))}
    </div>
  );
}
