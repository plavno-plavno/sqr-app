import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

export enum ChatMessageType {
  Text = "text",
  Success = "success",
  LineChart = "line-chart",
  PieChart = "pie-chart",
  ContactList = "contact-list",
  MoneyInfo = "money-info",
  MoneyTransfer = "money-transfer",
  Subscription = "subscription",
}

export enum AttachmentType {
  Image = "image",
}

export type Attachment = {
  image?: string;
  type: AttachmentType;
};

export interface ChatMessage {
  id: string;
  text: string;
  body?: Attachment;
  type: ChatMessageType;
  role: "user" | "agent";
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface State {
  chats: Record<string, Chat>;
}

interface Actions {
  setTitle: (chatId: string, title: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  createChat: (chatId: string, title?: string) => void;
}

type Store = State & Actions;

const useChatStoreBase = create<Store>()(
  persist(
    immer((set) => ({
      chats: {},
      setTitle: (chatId: string, title: string) =>
        set((state) => {
          if (!state.chats[chatId]) {
            state.chats[chatId] = { id: chatId, title, messages: [] };
          } else {
            state.chats[chatId].title = title;
          }
        }),
      addMessage: (chatId: string, message: ChatMessage) =>
        set((state) => {
          if (!state.chats[chatId]) {
            state.chats[chatId] = {
              id: chatId,
              title: "New Chat",
              messages: [message],
            };
          } else {
            state.chats[chatId].messages.push(message);
          }
        }),
      createChat: (chatId: string, title) =>
        set((state) => {
          state.chats[chatId] = {
            id: chatId,
            title: title || "New Chat",
            messages: [],
          };
        }),
    })),
    {
      name: "chat-store",
    }
  )
);

export const useChatStore = createSelectors(useChatStoreBase);
