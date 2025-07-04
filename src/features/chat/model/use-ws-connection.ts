import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "@/features/chat";
import { requests } from "@/shared/api";
import { AudioQueueManager } from "@/shared/lib/audio/audio-queue-manager";
import { WebSocketConnection } from "@/shared/lib/websocket/websocket-connection";
import { defaultLanguage } from "@/shared/mock/languages";
import { defaultPrompt } from "@/shared/mock/prompt";
import {
  IntentType,
  type IntentResponse,
  type SpendingAnalyticsOutput,
} from "@/shared/model/intents";
import type {
  AudioResponse,
  ServerResponse,
  TextResponse,
  TranslationResponse,
} from "@/shared/model/websocket";
import axios from "axios";
import { useEffect } from "react";
import { useEffectEvent } from "use-effect-event";
import { v4 as uuidv4 } from "uuid";
import { useWebSocketStore } from "./websocket-store";
import { useAudioStore } from "./audio-store";

interface UseWSConnectionProps {
  chatId: string;
  onNewMessage?: (message: ChatMessage) => void;
}

export const useWSConnection = (config: UseWSConnectionProps) => {
  const { chatId, onNewMessage } = config;

  const audioQueue = useAudioStore.use.audioQueue();
  const audioManager = useAudioStore.use.audioManager();
  const setAudioQueue = useAudioStore.use.setAudioQueue();

  const addMessage = useChatStore.use.addMessage();
  const updateMessage = useChatStore.use.updateMessage();
  const getMessages = useChatStore.use.getMessages();
  const setDialog = useChatStore.use.setDialog();
  const setLastMessageMeta = useChatStore.use.setLastMessageMeta();
  const getLastMessageMeta = useChatStore.use.getLastMessageMeta();

  const getFreeMachine = async (controller: AbortController) => {
    const req = await requests.getFreeMachine({ signal: controller.signal });
    const freeMachine = req?.data;

    return `wss://${freeMachine.dns}:${freeMachine.port}`;
  };

  const getLastMessageByRole = (roles: ChatMessageRole[]) => {
    const messages = getMessages(chatId);
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (roles.includes(message.role)) return message;
    }
    return null;
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
      messages.length !== 0 &&
      lastMessage?.role === ChatMessageRole.AGENT &&
      +lastMessageMeta.start >= +start
    ) {
      setLastMessageMeta(chatId, { start, end });
      return;
    }

    if (
      !lastMessage ||
      lastMessage?.role === ChatMessageRole.AGENT ||
      lastMessage?.role === ChatMessageRole.USER_TEXT
    ) {
      const newMessage = { ...message, id: uuidv4() };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
    }

    if (
      lastMessage?.role === ChatMessageRole.USER_VOICE &&
      !lastMessage.isTextCorrected
    ) {
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
      const lastUserMessage = getLastMessageByRole([
        ChatMessageRole.USER_VOICE,
        ChatMessageRole.USER_TEXT,
      ]);
      if (!lastUserMessage) return;

      updateMessage(chatId, {
        ...lastUserMessage,
        text: segments.current_user_text,
        isTextCorrected: true,
      });
      return;
    }

    // Temporary fix for spending analytics text
    if (
      "intent" in segments &&
      "output" in segments &&
      segments.intent === IntentType.SPENDING_ANALYTICS &&
      (segments.output as SpendingAnalyticsOutput)?.spending_analysis
        ?.categories.length === 0
    ) {
      const newMessage = {
        id: uuidv4(),
        type: ChatMessageType.TEXT,
        role: ChatMessageRole.AGENT,
        text: segments.text,
      };
      addMessage(chatId, newMessage);
      onNewMessage?.(newMessage);
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
        audioManager?.toggleMute(true);
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
      if (!audioQueue) {
        setAudioQueue(
          new AudioQueueManager(undefined, audioManager || undefined)
        );
      }
      audioQueue?.addToQueue(audioResponse.audio);
    }
  };

  const handleWSMessage = useEffectEvent(
    (response: ServerResponse, chatId?: string) => {
      if (!chatId) return;
      if (!("segments" in response)) return;
      if (typeof response.segments !== "object") return;

      // User transcription response
      if (
        response.type === "transcription" &&
        Array.isArray(response.segments)
      ) {
        handleUserTranscription(chatId, response.segments);
      }

      // Agent response
      if (response.type === "agent" && !Array.isArray(response.segments)) {
        handleAgentResponse(chatId, response.segments);
      }
    }
  );

  useEffect(() => {
    const { setConnection, setIsConnected, setWsError } = useWebSocketStore.getState();
    const controller = new AbortController();
    const ws = new WebSocketConnection(defaultLanguage, defaultPrompt);
    setConnection(ws);

    async function init() {
      try {
        const url = await getFreeMachine(controller);

        if (controller.signal.aborted) return;

        await ws.initSocket(url, (response) => {
          handleWSMessage(response, chatId);
        });
        setIsConnected(true);
      } catch (error) {
        if (axios.isCancel(error)) return;
        setWsError((error as Error).message);
        ws.closeConnection();
        setConnection(null);
      }
    }

    init();

    return () => {
      controller.abort();
      ws.closeConnection();
      setConnection(null);
      setIsConnected(false);
    };
  }, [chatId]);
};
