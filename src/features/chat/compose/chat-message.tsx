import { ChatMessageType, type ChatMessage } from "../model/chat-store";
import { ChatChartMessage } from "../ui/chat-messages/chat-chart-message";
import { ChatContactListMessage, type Contact } from "../ui/chat-messages/chat-contact-list-message";
import { ChatTextMessage } from "../ui/chat-messages/chat-text-message";

interface ChatMessageProps {
  message: ChatMessage;
}

const contactListMock: Contact[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+1234567890",
  },
  {
    id: "2",
    name: "Jane Doe",
    phone: "+1234567890",
  },
  {
    id: "3",
    name: "John Smith",
    phone: "+1234567890",
  },
];

export function ChatMessage({ message }: ChatMessageProps) {
  const { text, type, role } = message;

  if (type === ChatMessageType.ContactList) {
    return <ChatContactListMessage contacts={contactListMock} />;
  }

  if (type === ChatMessageType.Chart) {
    return <ChatChartMessage />;
  }

  if (type === ChatMessageType.Text) {
    return <ChatTextMessage text={text} role={role} />;
  }

  return <p className="text-2xl">Unknown message type: {type}</p>;
}
