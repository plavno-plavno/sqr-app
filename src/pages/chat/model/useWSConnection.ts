import { AudioQueueManager } from "@/features/audio";
import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "@/features/chat";
import { WebSocketConnection } from "@/features/websocket";
import { requests } from "@/shared/api";
import { defaultLanguage } from "@/shared/mock/languages";
import { defaultPrompt } from "@/shared/mock/prompt";
import { IntentType, type IntentResponse } from "@/shared/model/intents";
import type {
  AudioResponse,
  ServerResponse,
  TextResponse,
  TranslationResponse,
} from "@/shared/model/websocket";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useWSConnection = (
  chatId?: string,
  onNewMessage?: (message: ChatMessage) => void
) => {
  const addMessage = useChatStore.use.addMessage();
  const updateMessage = useChatStore.use.updateMessage();
  const getMessages = useChatStore.use.getMessages();
  const setDialog = useChatStore.use.setDialog();
  const setLastMessageMeta = useChatStore.use.setLastMessageMeta();
  const getLastMessageMeta = useChatStore.use.getLastMessageMeta();

  const audioQueueRef = useRef<AudioQueueManager | null>(null);
  const wsConnectionRef = useRef<WebSocketConnection | null>(null);

  const [isConnecting, setIsConnecting] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);

  const getFreeMachine = async () => {
    try {
      const req = await requests.getFreeMachine();
      const freeMachine = req.data.free[0];
      return `wss://${freeMachine.dns}:${freeMachine.port}`;
    } catch (err) {
      console.log(err);
    }
  };

  const handleUserTranscription = (chatId: string, segments: TextResponse) => {
    const messages = getMessages(chatId);
    const lastMessageMeta = getLastMessageMeta(chatId) || {
      start: -1,
      end: -1,
    };
    const lastMessage = messages[messages.length - 1];
    const lastSegment = segments[segments.length - 1];
    const { text, start, end } = lastSegment;

    const message = {
      type: ChatMessageType.TEXT,
      role: ChatMessageRole.USER_VOICE,
      text,
      meta: { start, end },
    };

    if (
      segments.length !== 1 &&
      lastMessage?.role === ChatMessageRole.AGENT &&
      lastMessageMeta.start >= start
    ) {
      setLastMessageMeta(chatId, { start, end });
      return;
    }

    if (
      !lastMessage ||
      lastMessage?.role === ChatMessageRole.AGENT ||
      lastMessage?.role === ChatMessageRole.USER_TEXT
    ) {
      console.log("add message");
      const newMessage = { ...message, id: uuidv4() };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
    }

    if (lastMessage?.role === ChatMessageRole.USER_VOICE) {
      console.log("update message");
      updateMessage(chatId, { ...lastMessage, text });
    }

    setLastMessageMeta(chatId, { start, end });
  };

  const handleAgentResponse = (
    chatId: string,
    segments: AudioResponse | TranslationResponse | IntentResponse
  ) => {
    // Last user message
    if ("current_user_text" in segments) {
      return;
    }

    // Intent response from agent
    if ("intent" in segments && "output" in segments) {
      const intentResponse = segments as IntentResponse;

      if (
        intentResponse.intent === IntentType.BUY_BTC ||
        intentResponse.intent === IntentType.TRANSFER_MONEY ||
        intentResponse.intent === IntentType.SCHEDULED_TRANSFER
      ) {
        setDialog(true, intentResponse);
        return;
      }

      const newMessage = {
        id: uuidv4(),
        type: intentResponse.intent,
        role: ChatMessageRole.AGENT,
        text: segments.text,
        intent: intentResponse,
      };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
      return;
    }

    // Text response from agent
    if ("text" in segments) {
      const { text, start, end } = segments;

      const newMessage = {
        id: uuidv4(),
        type: ChatMessageType.TEXT,
        role: ChatMessageRole.AGENT,
        text,
        meta: { start, end },
      };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
    }

    // Audio response from agent
    if ("audio" in segments) {
      const audioResponse = segments as AudioResponse;
      if (!audioQueueRef.current) {
        audioQueueRef.current = new AudioQueueManager(setCurrentLevel);
      }
      audioQueueRef.current.addToQueue(audioResponse.audio);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    wsConnectionRef,
    audioQueueRef,
    isConnecting,
    currentLevel,
  };
};
