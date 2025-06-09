import { chatsMock } from "../model/chat";

export function ChatHistoryCard({ text }: { text: string }) {
  return (
    <div className="bg-sidebar-primary rounded-xl px-5 py-4">
      <span className="font-semibold text-foreground">{text}</span>
    </div>
  );
}

export function ChatHistoryList() {
  return (
    <div className="flex flex-col gap-2">
      {chatsMock.map((chat) => (
        <ChatHistoryCard key={chat.id} text={chat.text} />
      ))}
    </div>
  );
}
