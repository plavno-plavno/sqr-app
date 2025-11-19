import {
  AttachmentType,
  ChatInput,
  ChatMessageList,
  ChatMessageRole,
  ChatMessageType,
  type ImageState,
  useChatStore,
} from "@/features/chat";
import {
  useAudio,
  useAudioStore,
  useWSConnection,
} from "@/features/ws-connection";
import { useSettingsStore } from "@/features/settings";
import { useLanguageStore, availableLanguages } from "@/features/language";
import { AudioTimeline } from "@/features/audio-timeline";
import { VocalizerType } from "@/shared/model/websocket";
import CrossIcon from "@/shared/assets/icons/cross-icon.svg?react";
import {cn} from "@/shared/lib/css/tailwind";
import {type PathParams, ROUTES} from "@/shared/model/routes";
import {ErrorDialog} from "@/shared/ui/error-dialog";
import {
  Header,
  NewChatHeaderButton,
  SettingsHeaderButton,
} from "@/shared/ui/header";
import {Button} from "@/shared/ui/kit/button";
import {SidebarTrigger} from "@/shared/ui/kit/sidebar";
import {useEffect, useState} from "react";
import {
  data,
  // useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {ChatDialog} from "./compose/chat-dialog";
import {ChatMessage as ChatMessageComponent} from "./compose/chat-message";
// import { useEffectEvent } from "use-effect-event";
import {ChatSettingsDialog} from "./compose/chat-settings-dialog";
import {PromptType} from "@/shared/model/websocket.ts";

export async function loader({
  params,
}: {
  params: PathParams[typeof ROUTES.AGENT];
}) {
  const { agentName } = params;

  if (!agentName) {
    throw data("Agent name is required", { status: 400 });
  }

  return { agentName };
}

const AgentPage = () => {
  const {agentName} = useParams<PathParams[typeof ROUTES.AGENT]>();
  // const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const chats = useChatStore.use.chats();
  const addMessage = useChatStore.use.addMessage();
  const setLastMessageMeta = useChatStore.use.setLastMessageMeta();
  const createChat = useChatStore.use.createChat();

  const vocalizerType = useSettingsStore.use.vocalizerType();
  const setVocalizerType = useSettingsStore.use.setVocalizerType();

  const language = useLanguageStore.use.language();
  const setLanguage = useLanguageStore.use.setLanguage();

  // Get chatId from query params or use last chat from store
  const chatIdFromQuery = searchParams.get('chatId');
  const vocalizerTypeFromQuery = searchParams.get('vocalizerType') as VocalizerType | null;
  const languageFromQuery = searchParams.get('language');

  useEffect(() => {
    // If no chatId in query
    if (!chatIdFromQuery) {
      const lastChatId = Object.keys(chats).at(-1);

      if (lastChatId) {
        // Use last chat from store
        setSearchParams({ chatId: lastChatId }, { replace: true });
      } else {
        // Create new chat if store is empty
        const newChatId = uuidv4();
        createChat(newChatId);
        setSearchParams({ chatId: newChatId }, { replace: true });
      }
    } else if (chatIdFromQuery && !chats[chatIdFromQuery]) {
      // If chatId exists in URL but not in store (e.g., shared link)
      // Create a new chat and redirect (ignore the shared chatId)
      const newChatId = uuidv4();
      createChat(newChatId);
      setSearchParams({ chatId: newChatId }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIdFromQuery]);

  // Sync vocalizerType from URL to Store (URL has priority)
  useEffect(() => {
    if (vocalizerTypeFromQuery &&
        Object.values(VocalizerType).includes(vocalizerTypeFromQuery)) {
      if (vocalizerType !== vocalizerTypeFromQuery) {
        setVocalizerType(vocalizerTypeFromQuery);
      }
    }
  }, [vocalizerTypeFromQuery, vocalizerType, setVocalizerType]);

  // Auto-populate URL with vocalizerType if missing
  useEffect(() => {
    const vocalizerTypeParam = searchParams.get('vocalizerType');
    if (!vocalizerTypeParam && chatIdFromQuery) {
      const currentParams = Object.fromEntries(searchParams.entries());
      setSearchParams({
        ...currentParams,
        vocalizerType: vocalizerType
      }, { replace: true });
    }
  }, [chatIdFromQuery, searchParams, setSearchParams, vocalizerType]);

  // Sync language from URL to Store (URL has priority)
  useEffect(() => {
    if (languageFromQuery &&
        availableLanguages.some(lang => lang.code === languageFromQuery)) {
      const languageOption = availableLanguages.find(
        lang => lang.code === languageFromQuery
      );
      if (language.code !== languageFromQuery && languageOption) {
        setLanguage(languageOption);
      }
    }
  }, [languageFromQuery, language, setLanguage]);

  // Auto-populate URL with language if missing
  useEffect(() => {
    const languageParam = searchParams.get('language');
    if (!languageParam && chatIdFromQuery) {
      const currentParams = Object.fromEntries(searchParams.entries());
      setSearchParams({
        ...currentParams,
        language: language.code
      }, { replace: true });
    }
  }, [chatIdFromQuery, searchParams, setSearchParams, language]);

  const chatId = chatIdFromQuery;
  //
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  //
  const micEnabled = searchParams.get("mic") === "true";
  const searchParamsMessage = searchParams.get("prompt");

  const {
    isConnected,
    isConnecting,
    isReconnecting,
    wsError,
    initWSConnection,
    sendTextCommand,
    sendHelloMessage,
    setWsError,
  } = useWSConnection(chatId);

  const {
    audioError,
    isRecording,
    mediaStream,
    startRecording,
    stopRecording,
    setAudioError,
  } = useAudio();

  // const chatTitle = chats[chatId!]?.title || "";
  const messages = chats[chatId!]?.messages || [];
  const errorDialogOpen = !!wsError || !!audioError || isReconnecting;
  const errorDialogTitle = isReconnecting
    ? "Socket disconnected"
    : "Error occurred, please try again";
  const buttonText = isReconnecting ? "Close and realod" : "OK";
  const commonErrorMessage = wsError || audioError || "Something went wrong";
  const errorMessage = isReconnecting
    ? "Trying to reconnect..."
    : commonErrorMessage;

  // Send hello message if there is a new chat
  useEffect(() => {
    if (messages.length === 0 && isConnected) {
      sendHelloMessage();
    }
  }, [messages.length, isConnected, sendHelloMessage]);

  // Initialize WebSocket connection
  useEffect(() => {
      return initWSConnection();
  }, [initWSConnection]);

  // Stop recording when component unmounts
  useEffect(() => {
    return () => {
      // Check current recording state from store instead of closure
      if (useAudioStore.getState().isRecording) {
        stopRecording();
      }
    };
  }, [stopRecording]);

  // const handleMicActivation = useEffectEvent(() => {
  //   startRecording();
  //   navigate(location.pathname, { replace: true });
  // });

  // Enable mic if search param present
  useEffect(() => {
    //   if (!isConnected || !micEnabled) return;
    //
    //   handleMicActivation();
  }, [isConnected, micEnabled]);
  //
  // Send message if user input message in home page
  useEffect(() => {
    if (!isConnected || !searchParamsMessage) return;

    sendTextCommand(searchParamsMessage);
    //   // navigate(location.pathname, { replace: true });
  }, [isConnected, searchParamsMessage, sendTextCommand, navigate, location.pathname]);

  // Reset last message meta when chat is closed
  useEffect(() => {
    return () => {
      if (!chatId) return;
      // Get fresh state at cleanup time to check if chat exists
      const currentChats = useChatStore.getState().chats;
      if (!currentChats[chatId]) return;
      setLastMessageMeta(chatId, {start: "-1", end: "-1"});
    };
  }, [chatId, setLastMessageMeta]);

  const handleSubmit = (prompt: string, image?: ImageState) => {
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

    sendTextCommand(prompt);
    addMessage(chatId!, newMessage);
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleNewChatClick = async () => {
    await stopRecording();
    const newChatId = uuidv4();
    createChat(newChatId);
    setSearchParams({ chatId: newChatId });
  };

  const handleSettingsClick = () => {
    setOpenSettings(true);
  };

  return (
    <div
      className={cn(
        "h-full grid grid-rows-[min-content_min-content_auto] mx-5",
        !isRecording &&
        messages.length === 0 &&
        "grid-rows-[min-content_1fr_auto]",
        messages.length > 0 && "grid-rows-[auto_1fr_auto]"
      )}
    >
      <Header
        title={agentName}
        titleClassName="w-[calc(100%-150px)] left-13 translate-x-0"
        leftElement={<SidebarTrigger/>}
        rightElement={
          <div className="flex gap-2">
            <SettingsHeaderButton
              disabled={!isConnected}
              onClick={handleSettingsClick}
            />
            <NewChatHeaderButton onClick={handleNewChatClick}/>
          </div>
        }
      />

      <ChatMessageList>
        {messages?.map((message) => (
          <ChatMessageComponent key={message.id} message={message}/>
        ))}
      </ChatMessageList>

      {isRecording ? (
        <div className="grid grid-rows-[1fr_auto] justify-items-center my-5 -mx-5 gap-7">
          <div className="grid self-center place-items-center w-full">
            <AudioTimeline
              mediaStream={mediaStream}
              showControls={true}
            />
          </div>
          <Button
            className="rounded-full w-14 h-14 bg-primary "
            onClick={stopRecording}
          >
            <CrossIcon/>
          </Button>
        </div>
      ) : (
        <div className="my-5">
          <ChatInput
            disabled={isConnecting}
            showPlaceholder={false}
            onSubmit={handleSubmit}
            onMicClick={handleStartRecording}
          />
        </div>
      )}

      <ChatDialog/>

      <ErrorDialog
        open={errorDialogOpen}
        title={errorDialogTitle}
        description={errorMessage}
        buttonText={buttonText}
        onOpenChange={() => {
          if (isReconnecting) return window.location.reload();

          setAudioError(null);
          setWsError(null);
        }}
      />

      <ChatSettingsDialog
        open={openSettings}
        onOpenChange={setOpenSettings}
        currentAgent={agentName as PromptType}
        agentName={agentName as PromptType}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </div>
  );
};

export const Component = AgentPage;
