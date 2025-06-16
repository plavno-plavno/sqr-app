import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { IntentResponse } from "@/shared/model/intents";

// export enum ChatMessageType {
//   Text = "text",
//   Success = "success",
//   LineChart = "line-chart",
//   PieChart = "pie-chart",
//   ContactList = "contact-list",
//   MoneyInfo = "money-info",
//   MoneyTransfer = "money-transfer",
//   Subscription = "subscription",
// }

export enum ChatMessageType {
  Text = "text",
  Intent = "intent",
}

export enum ChatMessageRole {
  User = "user",
  Agent = "agent",
}

export enum AttachmentType {
  Image = "image",
}

export type Attachment = {
  image?: string;
  type: AttachmentType;
};

export interface MessageMeta {
  start: string;
  end: string;
}

export interface ChatMessage {
  id: string;
  text?: string;
  intent?: IntentResponse;
  body?: Attachment;
  type: ChatMessageType;
  role: ChatMessageRole;
  meta?: MessageMeta;
}

export interface ChatDialog {
  open: boolean;
  dialogIntent: IntentResponse | null;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface State {
  dialog: ChatDialog;
  chats: Record<string, Chat>;
}

interface Actions {
  setTitle: (chatId: string, title: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, message: ChatMessage) => void;
  createChat: (chatId: string, title?: string) => void;
  getMessages: (chatId?: string) => ChatMessage[];
  setDialog: (open: boolean, dialogIntent: IntentResponse | null) => void;
}

type Store = State & Actions;

const useChatStoreBase = create<Store>()(
  persist(
    immer((set, get) => ({
      chats: {},
      dialog: {
        open: false,
        dialogIntent: null,
      },
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
              title: message.text || "", // Set first message as title
              messages: [message],
            };
          } else {
            // If chat has no title, set the message text as title
            if (!state.chats[chatId].title && message.text) {
              state.chats[chatId].title = message.text;
            }
            state.chats[chatId].messages.push(message);
          }
        }),
      updateMessage: (chatId: string, message: ChatMessage) =>
        set((state) => {
          const messageIndex = state.chats[chatId].messages.findIndex(
            (m) => m.id === message.id
          );
          if (messageIndex !== -1) {
            state.chats[chatId].messages[messageIndex] = message;
          }
        }),
      createChat: (chatId: string, title) =>
        set((state) => {
          state.chats[chatId] = {
            id: chatId,
            title: title ?? "",
            messages: [],
          };
        }),
      getMessages: (chatId?: string) =>
        chatId ? get().chats[chatId]?.messages || [] : [],
      setDialog: (open: boolean, dialogIntent: IntentResponse | null) =>
        set((state) => {
          state.dialog = {
            open,
            dialogIntent,
          };
        }),
    })),
    {
      name: "chat-store",
    }
  )
);

export const useChatStore = createSelectors(useChatStoreBase);
