import {
  ChatInput,
  ChatMessageList,
  useChatStore,
  ChatMessageType,
} from "@/features/chat";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { AiCircleIcon } from "@/shared/ui/icons/AiCircleIcon";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ChatPage = () => {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const addMessage = useChatStore.use.addMessage();

  const [messageType, setMessageType] = useState<ChatMessageType>(
    ChatMessageType.Text
  );

  if (!chatId) {
    return <Navigate to={ROUTES.HOME} />;
  }

  const handleSubmit = (prompt: string) => {
    console.log(prompt);
    addMessage(chatId, {
      id: uuidv4(),
      role: "user",
      text: prompt,
      type: messageType,
    });
  };

  return (
    <div className="grid grid-rows-[1fr_auto] h-[calc(100vh-80px)] mx-5">
      <ScrollArea className="h-full overflow-hidden pr-3.5 -mr-3.5">
        {/* Chat messages */}
        <ChatMessageList />

        {/* AI Circle */}
        <div className="grid place-items-center">
          <AiCircleIcon />
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="my-5 grid grid-cols-[auto_auto] gap-1">
        <ChatInput showPlaceholder={false} onSubmit={handleSubmit} />
        <Select
          onValueChange={(value) => setMessageType(value as ChatMessageType)}
          defaultValue={messageType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ChatMessageType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const Component = ChatPage;
