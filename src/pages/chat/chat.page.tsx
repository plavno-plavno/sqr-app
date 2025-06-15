import {
  AttachmentType,
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardBuy,
  ChatDialogPaymentCard,
  ChatInput,
  ChatMessageList,
  ChatMessageType,
  type ImageState,
  useChatStore,
} from "@/features/chat";
import voice from "@/shared/assets/animations/voice.json";
import CrossIcon from "@/shared/assets/icons/cross-icon.svg?react";
import { cn } from "@/shared/lib/css/tailwind";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAudio } from "./model/useAudio";
import { useWSConnection } from "./model/useWSConnection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

const ChatPage = () => {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addMessage = useChatStore.use.addMessage();
  const chats = useChatStore.use.chats();

  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<ChatMessageType>(
    ChatMessageType.Text
  );

  const micEnabled = searchParams.get("mic") === "true";

  const scrollToMessage = (messageId: string) => {
    setTimeout(() => {
      const messageElement = document.getElementById(messageId);
      messageElement?.scrollIntoView();
    }, 0);
  };

  const { isConnecting, wsConnectionRef, audioQueueRef } = useWSConnection(
    chatId,
    // Scroll to message when it's added
    (message) => scrollToMessage(message.id)
  );
  const { isRecording, startRecording, stopRecording } = useAudio(
    wsConnectionRef,
    audioQueueRef,
    // Update Lottie animation frame based on voice level
    (level) => {
      if (!lottieRef.current) return;

      const totalFrames = lottieRef.current?.getDuration(true);

      if (!totalFrames) return;

      const frame = Math.floor(level * 2 * totalFrames);
      lottieRef.current.goToAndStop(frame, true);
    }
  );

  // Activate mic when user clicks on mic button in home page
  useEffect(() => {
    if (micEnabled && !isConnecting) {
      startRecording();
      navigate(location.pathname, { replace: true });
    }
  }, [micEnabled, isConnecting, startRecording, navigate, location.pathname]);

  if (!chatId) {
    return <Navigate to={ROUTES.HOME} />;
  }

  const handleSubmit = (prompt: string, image?: ImageState) => {
    const newMessage = {
      id: uuidv4(),
      role: "user" as const,
      text: prompt,
      type: messageType,
      ...(image && {
        body: {
          type: AttachmentType.Image,
          image: image.imagePreview,
        },
      }),
    };
    addMessage(chatId, newMessage);
    scrollToMessage(newMessage.id);
  };

  const messages = chats[chatId]?.messages || [];

  return (
    <div
      className={cn(
        "h-[calc(100dvh-80px)] grid grid-rows-[min-content_auto] mx-5",
        messages.length > 0 && "grid-rows-[1fr_auto]"
      )}
    >
      <ChatMessageList />

      {/* Chat input */}
      {isRecording ? (
        <div className="grid grid-rows-[1fr_auto] justify-items-center my-5 -mx-5 gap-7">
          <div
            className="grid self-center place-items-center w-full"
            onClick={() => setOpenConfirmDialog(true)}
          >
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
            disabled={isConnecting}
            showPlaceholder={false}
            onSubmit={handleSubmit}
            onMicClick={startRecording}
          />
          <Select
            onValueChange={(value) => setMessageType(value as ChatMessageType)}
            defaultValue={messageType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ChatMessageType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chat confirm dialog */}
      <ChatConfirmDialog
        title="Sure, just confirm"
        open={openConfirmDialog}
        onOpenChange={setOpenConfirmDialog}
      >
        <ChatDialogActionCard>
          {/* <ChatDialogActionCardDetails
            details={[
              { name: "Bank Name", value: "ING Bank N.V." },
              { name: "IBAN", value: "NL42INGB0020101346" },
            ]}
          />
          <ChatDialogActionCardRecipient
            name="John Doe"
            phone="1234567890"
            date={new Date()}
          /> */}
          <ChatDialogActionCardBuy amount={100} coin="BTC" />
          <ChatDialogActionCardAmount amount={100} restAmount={15600} />
        </ChatDialogActionCard>
        <ChatDialogPaymentCard
          title="Pay using"
          identifier="**** 7890"
          paymentMethod="Credit Card"
        />
        <ChatDialogPaymentCard
          title="Wallet address"
          identifier="17rm2dvb439dZqyMe2d4D6AQJSgg6yeNRn"
          paymentMethod="Metamask"
        />
      </ChatConfirmDialog>
    </div>
  );
};

export const Component = ChatPage;
