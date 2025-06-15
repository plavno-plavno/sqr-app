import { AudioQueueManager } from "@/features/audio";
import {
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "@/features/chat";
import { WebSocketConnection } from "@/features/websocket";
import { requests } from "@/shared/api";
import { defaultLanguage } from "@/shared/mock/languages";
import { defaultPrompt } from "@/shared/mock/prompt";
import type {
  AudioResponse,
  ServerResponse,
  TextResponse,
  TranslationResponse,
} from "@/shared/model/requests";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useWSConnection = (
  chatId?: string,
  onNewMessage?: (message: ChatMessage) => void
) => {
  const addMessage = useChatStore.use.addMessage();
  const updateMessage = useChatStore.use.updateMessage();
  const getMessages = useChatStore.use.getMessages();

  const audioQueueRef = useRef<AudioQueueManager | null>(null);
  const wsConnectionRef = useRef<WebSocketConnection | null>(null);

  const [isConnecting, setIsConnecting] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);

  const getFreeMachine = async () => {
    try {
      const req = await requests.getFreeMachine();
      return `wss://${req.data.dns}:${req.data.port}`;
    } catch (err) {
      console.log(err);
    }
  };

  // const getLastUserMessage = (messages: ChatMessage[]) => {
  //   for (let i = messages.length - 1; i >= 0; i--) {
  //     if (messages[i].role === "user") {
  //       return messages[i];
  //     }
  //   }
  //   return null;
  // };

  const handleUserTranscription = (chatId: string, segments: TextResponse) => {
    const messages = getMessages(chatId);
    const lastMessage = messages[messages.length - 1];
    const lastSegment = segments[segments.length - 1];
    const { text, start, end } = lastSegment;

    const message = {
      type: ChatMessageType.Text,
      role: "user" as const,
      text,
      meta: { start, end },
    };

    // If the last message is the same as the current message, update it, otherwise add a new message
    if (lastMessage?.meta?.start && lastMessage?.meta?.start >= start) {
      updateMessage(chatId, {
        ...message,
        id: lastMessage?.id,
      });
    } else {
      const newMessage = { ...message, id: uuidv4() };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
    }
  };

  const handleAgentResponse = (
    chatId: string,
    segments: AudioResponse | TranslationResponse
  ) => {
    // Audio response from agent
    if ("audio" in segments) {
      const audioResponse = segments as AudioResponse;
      if (!audioQueueRef.current) {
        audioQueueRef.current = new AudioQueueManager(setCurrentLevel);
      }
      audioQueueRef.current.addToQueue(audioResponse.audio);
    }
    // Text response from agent
    if ("text" in segments) {
      const { text, start, end } = segments;

      const newMessage = {
        id: uuidv4(),
        type: ChatMessageType.Text,
        role: "agent" as const,
        text,
        meta: { start, end },
      };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
    }
  };

  const handleWSMessage = (response: ServerResponse) => {
    if (!chatId) return;
    if (!("segments" in response)) return;
    if (typeof response.segments !== "object") return;

    // User transcription response
    if (response.type === "transcription" && Array.isArray(response.segments)) {
      handleUserTranscription(chatId, response.segments);
    }

    // Agent response
    if (response.type === "agent" && !Array.isArray(response.segments)) {
      handleAgentResponse(chatId, response.segments);
    }
  };

  const initWSConnection = async () => {
    if (wsConnectionRef.current) return;

    try {
      setIsConnecting(true);
      wsConnectionRef.current = new WebSocketConnection(
        defaultLanguage,
        defaultPrompt
      );

      const url = await getFreeMachine();

      if (!url) throw new Error("No free machine found");

      await wsConnectionRef.current.initSocket(url, handleWSMessage);
    } catch (error) {
      console.log("Failed to init websocket or audio:", error);
      wsConnectionRef.current = null;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    initWSConnection();

    return () => {
      wsConnectionRef.current?.closeConnection();
    };
  }, []);

  return {
    wsConnectionRef,
    audioQueueRef,
    isConnecting,
    currentLevel,
  };
};
