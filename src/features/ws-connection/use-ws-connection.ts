import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
} from "@/features/chat";
import { requests } from "@/shared/api";
import { AudioQueueManager } from "@/shared/lib/audio/audio-queue-manager";
import { WebSocketConnection } from "@/shared/lib/websocket/websocket-connection";
import {
  IntentType,
  type IntentResponse,
  type OperationInfo,
  type SpendingAnalyticsOutput,
} from "@/shared/model/intents";
import type {
  AudioResponse,
  ServerResponse,
  TextResponse,
  TranslationResponse,
} from "@/shared/model/websocket";
import axios from "axios";
import { useEffectEvent } from "use-effect-event";
import { v4 as uuidv4 } from "uuid";
import { useWebSocketStore } from "./websocket-store";
import { useAudioStore } from "./audio-store";
import { useCallback } from "react";

export const useWSConnection = () => {
  const audioQueue = useAudioStore.use.audioQueue();
  const audioManager = useAudioStore.use.audioManager();
  const setAudioQueue = useAudioStore.use.setAudioQueue();
  const clearAudio = useAudioStore.use.clearAudio();

  const addMessage = useChatStore.use.addMessage();
  const updateMessage = useChatStore.use.updateMessage();
  const getMessages = useChatStore.use.getMessages();
  const setDialog = useChatStore.use.setDialog();
  const setLastMessageMeta = useChatStore.use.setLastMessageMeta();
  const getLastMessageMeta = useChatStore.use.getLastMessageMeta();

  const connection = useWebSocketStore.use.connection();
  const isConnected = useWebSocketStore.use.isConnected();
  const isConnecting = useWebSocketStore.use.isConnecting();
  const wsError = useWebSocketStore.use.wsError();
  const setWsError = useWebSocketStore.use.setWsError();

  const getFreeMachine = async (controller: AbortController) => {
    const req = await requests.getFreeMachine({ signal: controller.signal });
    const freeMachine = req?.data;

    if (!freeMachine) throw new Error("No free machine found");

    return `wss://${freeMachine.dns}:${freeMachine.port}`;
  };

  const getLastMessageByRole = (chatId: string, roles: ChatMessageRole[]) => {
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
    }

    if (
      lastMessage?.role === ChatMessageRole.USER_VOICE &&
      !lastMessage.isTextCorrected
    ) {
      updateMessage(chatId, { ...lastMessage, text });
    }

    setLastMessageMeta(chatId, { start, end });
  };

  const handleAgentResponse = async (
    chatId: string,
    segments: AudioResponse | TranslationResponse | IntentResponse
  ) => {
    // Last user message
    if ("current_user_text" in segments) {
      const lastUserMessage = getLastMessageByRole(chatId, [
        ChatMessageRole.USER_VOICE,
        ChatMessageRole.USER_TEXT,
      ]);
      if (!lastUserMessage || lastUserMessage.isTextCorrected) return;

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

      if (intentResponse.intent === IntentType.GOODBYE) {
        addMessage(chatId, {
          id: uuidv4(),
          type: ChatMessageType.HIDDEN,
          role: ChatMessageRole.AGENT,
        });
        await audioManager?.stop();
        setDialog(false, null);
        clearAudio();
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
    }

    // Audio response from agent
    if ("audio" in segments) {
      const audioResponse = segments as AudioResponse;

      let newAudioQueue;

      if (!audioQueue) {
        newAudioQueue = new AudioQueueManager();
        setAudioQueue(newAudioQueue);
      } else {
        newAudioQueue = audioQueue;
      }

      newAudioQueue?.addToQueue(audioResponse);
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

  const initWSConnection = useCallback(
    (chatId: string, language: string, prompt: string) => {
      const { setConnection, setIsConnected, setWsError, setIsConnecting } =
        useWebSocketStore.getState();
      const controller = new AbortController();
      const ws = new WebSocketConnection(language, prompt);
      setConnection(ws);

      async function init() {
        try {
          setIsConnecting(true);
          const url = await getFreeMachine(controller);

          if (controller.signal.aborted) return;

          await ws.initSocket(url, (response) => {
            handleWSMessage(response, chatId);
          });
          setIsConnected(true);
          setIsConnecting(false);
        } catch (error) {
          if (axios.isCancel(error)) return;
          setWsError((error as Error).message);
          ws.closeConnection();
          setIsConnecting(false);
          setConnection(null);
        }
      }

      init();

      return () => {
        controller.abort();
        ws.closeConnection();
        setConnection(null);
        setIsConnected(false);
        setIsConnecting(false);
      };
    },
    []
  );

  const sendCommand = useCallback(
    (command: (connection: WebSocketConnection) => void) => {
      try {
        if (!connection) throw new Error("Socket is not connected");
        command(connection);
      } catch (error) {
        setWsError((error as Error).message);
      }
    },
    [connection, setWsError]
  );

  const sendTextCommand = useCallback(
    (text: string) => {
      sendCommand((connection) => connection.sendTextCommand(text));
    },
    [sendCommand]
  );

  const sendConfirmationCommand = useCallback(
    (operationInfo: OperationInfo) => {
      sendCommand((connection) =>
        connection.sendConfirmationCommand(operationInfo)
      );
    },
    [sendCommand]
  );

  const sendAudioData = useCallback(
    (base64Data: string, voicestop: boolean) => {
      sendCommand((connection) =>
        connection.sendAudioData(base64Data, voicestop)
      );
    },
    [sendCommand]
  );

  const sendVoiceEndCommand = useCallback(() => {
    sendCommand((connection) => connection.sendVoiceEndCommand());
  }, [sendCommand]);

  return {
    isConnected,
    isConnecting,
    wsError,
    initWSConnection,
    sendTextCommand,
    sendConfirmationCommand,
    sendAudioData,
    sendVoiceEndCommand,
    setWsError,
  };
};
