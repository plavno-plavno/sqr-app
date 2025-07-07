import {
  AttachmentType,
  ChatDialog,
  ChatInput,
  type ChatMessage,
  ChatMessageList,
  ChatMessageRole,
  ChatMessageType,
  type ImageState,
  useChatStore,
} from "@/features/chat";
import { useAudio } from "@/features/ws-connection";
import { useWSConnection } from "@/features/ws-connection";
import voice from "@/shared/assets/animations/voice.json";
import CrossIcon from "@/shared/assets/icons/cross-icon.svg?react";
import { cn } from "@/shared/lib/css/tailwind";
import type { OperationInfo } from "@/shared/model/intents";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { ErrorDialog } from "@/shared/ui/error-dialog";
import { Header, NewChatHeaderButton } from "@/shared/ui/header";
import { Button } from "@/shared/ui/kit/button";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  href,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffectEvent } from "use-effect-event";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage as ChatMessageComponent } from "./compose/chat-message";

const ChatPage = () => {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const chats = useChatStore.use.chats();
  const addMessage = useChatStore.use.addMessage();
  const setLastMessageMeta = useChatStore.use.setLastMessageMeta();
  const createChat = useChatStore.use.createChat();

  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const [errorDialog, setErrorDialog] = useState<boolean>(false);

  const micEnabled = searchParams.get("mic") === "true";
  const searchParamsMessage = searchParams.get("message");

  const {
    isConnected,
    wsError,
    initWSConnection,
    sendTextCommand,
    sendConfirmationCommand,
    setWsError,
  } = useWSConnection();

  const {
    audioManager,
    audioError,
    audioVoiceError,
    isRecording,
    startRecording,
    stopRecording,
    cleanAudioErrors,
  } = useAudio({
    onMicLevelChange: (level) => {
      if (!lottieRef.current) return;

      const totalFrames = lottieRef.current?.getDuration(true);

      if (!totalFrames) return;

      const frame = Math.floor(level * 2 * totalFrames);
      lottieRef.current.goToAndStop(frame, true);
    },
  });

  const checkError = useEffectEvent(() => {
    if (!wsError && !audioError) return false;

    setErrorDialog(true);
    return true;
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!chatId) return;
    return initWSConnection(chatId);
  }, [chatId, initWSConnection]);

  // Activate mic when user clicks on mic button in home page
  useEffect(() => {
    if (!isConnected || !micEnabled) return;
    if (checkError()) {
      navigate(location.pathname, { replace: true });
      return;
    }

    startRecording();
    navigate(location.pathname, { replace: true });
  }, [micEnabled, isConnected, startRecording, navigate, location.pathname]);

  // Send message if user input message in home page
  useEffect(() => {
    if (!isConnected || !searchParamsMessage) return;
    if (checkError()) {
      navigate(location.pathname, { replace: true });
      return;
    }

    try {
      sendTextCommand(searchParamsMessage);
    } catch {
      setErrorDialog(true);
    } finally {
      navigate(location.pathname, { replace: true });
    }
  }, [
    isConnected,
    searchParamsMessage,
    sendTextCommand,
    navigate,
    location.pathname,
  ]);

  // Reset last message meta when chat is closed
  useEffect(() => {
    return () => {
      if (!chatId) return;
      setLastMessageMeta(chatId, { start: "-1", end: "-1" });
    };
  }, [chatId, setLastMessageMeta]);

  const handleDialogConfirm = useCallback(
    (message: ChatMessage, operationInfo: OperationInfo) => {
      if (checkError()) return;

      try {
        addMessage(chatId!, message);
        sendConfirmationCommand(operationInfo);
        audioManager?.toggleMute(false);
      } catch {
        setErrorDialog(true);
      }
    },
    [addMessage, chatId, sendConfirmationCommand, audioManager, setErrorDialog]
  );

  const handleDialogClose = useCallback(() => {
    audioManager?.toggleMute(false);
  }, [audioManager]);

  if (!chatId) {
    return <Navigate to={ROUTES.HOME} />;
  }

  const handleSubmit = (prompt: string, image?: ImageState) => {
    if (checkError()) return;

    const newMessage = {
      id: uuidv4(),
      role: ChatMessageRole.USER_TEXT,
      text: prompt,
      type: ChatMessageType.TEXT,
      ...(image && {
        body: {
          type: AttachmentType.IMAGE,
          image: image.imagePreview,
        },
      }),
    };

    try {
      sendTextCommand(prompt);
      addMessage(chatId, newMessage);
    } catch {
      setErrorDialog(true);
    }
  };

  const handleStartRecording = () => {
    if (checkError()) return;
    startRecording();
  };

  const handleNewChatClick = () => {
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.CHAT, { chatId })}`);
  };

  const chatTitle = chats[chatId]?.title || "";
  const messages = chats[chatId]?.messages || [];
  const errorDialogOpen = errorDialog || !!audioVoiceError;
  const errorMessage =
    wsError || audioVoiceError || audioError || "Something went wrong";

  return (
    <div
      className={cn(
        "h-full grid grid-rows-[min-content_min-content_auto] mx-5",
        messages.length > 0 && "grid-rows-[auto_1fr_auto]"
      )}
    >
      <Header
        title={chatTitle}
        leftElement={<SidebarTrigger />}
        rightElement={<NewChatHeaderButton onClick={handleNewChatClick} />}
      />

      <ChatMessageList>
        {messages?.map((message) => (
          <div id={message.id} key={message.id}>
            <ChatMessageComponent message={message} />
          </div>
        ))}
      </ChatMessageList>

      {isRecording ? (
        <div className="grid grid-rows-[1fr_auto] justify-items-center my-5 -mx-5 gap-7">
          <div className="grid self-center place-items-center w-full">
            <Lottie
              animationData={voice}
              lottieRef={lottieRef}
              autoplay={false}
              style={{ width: "100%" }}
            />
          </div>
          <Button
            className="rounded-full w-14 h-14 bg-primary "
            onClick={stopRecording}
          >
            <CrossIcon />
          </Button>
        </div>
      ) : (
        <div className="my-5 grid grid-cols-[1fr_auto] items-end gap-1">
          <ChatInput
            disabled={!isConnected}
            showPlaceholder={false}
            onSubmit={handleSubmit}
            onMicClick={handleStartRecording}
          />
        </div>
      )}

      <ChatDialog
        handleConfirm={handleDialogConfirm}
        handleClose={handleDialogClose}
      />

      <ErrorDialog
        open={errorDialogOpen}
        title="Error occurred, please try again"
        description={errorMessage}
        onOpenChange={() => {
          setErrorDialog(false);
          cleanAudioErrors();
          setWsError(null);
        }}
      />
    </div>
  );
};

export const Component = ChatPage;
