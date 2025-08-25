import { useChatStore } from "@/features/chat";
import { useLayoutEffect } from "react";
import { Navigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {
  const createChat = useChatStore.use.createChat();
  const chatId = uuidv4();

  useLayoutEffect(() => {
    createChat(chatId, "New Chat");
  }, [createChat, chatId]);

  return <Navigate to={`chat/${chatId}`} />;
};

export const Component = HomePage;
