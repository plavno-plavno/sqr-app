import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { IntentType, type IntentResponse } from "@/shared/model/intents";

export enum ChatMessageType {
  TEXT = "text",
  SUCCESS = "success",
}

export enum ChatMessageRole {
  USER_VOICE = "user_voice",
  USER_TEXT = "user_text",
  AGENT = "agent",
}

export enum AttachmentType {
  IMAGE = "image",
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
  type: ChatMessageType | IntentType;
  role: ChatMessageRole;
}

export interface ChatDialog {
  open: boolean;
  dialogIntent: IntentResponse | null;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageMeta?: MessageMeta;
}

interface State {
  dialog: ChatDialog;
  chats: Record<string, Chat>;
}

interface Actions {
  createChat: (chatId: string, title?: string) => void;
  setTitle: (chatId: string, title: string) => void;
  setLastMessageMeta: (chatId: string, meta: MessageMeta) => void;
  getLastMessageMeta: (chatId: string) => MessageMeta | undefined;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, message: ChatMessage) => void;
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
      createChat: (chatId: string, title) =>
        set((state) => {
          state.chats[chatId] = {
            id: chatId,
            title: title ?? "",
            messages: [],
          };
        }),
      setTitle: (chatId: string, title: string) =>
        set((state) => {
          if (!state.chats[chatId]) {
            state.chats[chatId] = { id: chatId, title, messages: [] };
          } else {
            state.chats[chatId].title = title;
          }
        }),
      setLastMessageMeta: (chatId: string, meta: MessageMeta) =>
        set((state) => {
          state.chats[chatId].lastMessageMeta = meta;
        }),
      getLastMessageMeta: (chatId: string) =>
        get().chats[chatId]?.lastMessageMeta,
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
