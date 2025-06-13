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
import AiCircleIcon from "@/shared/assets/icons/ai-circle-icon.svg?react";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ChatPage = () => {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const addMessage = useChatStore.use.addMessage();
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<ChatMessageType>(
    ChatMessageType.Text
  );

  if (!chatId) {
    return <Navigate to={ROUTES.HOME} />;
  }

  const handleSubmit = (prompt: string, image?: ImageState) => {
    console.log(prompt, image);
    addMessage(chatId, {
      id: uuidv4(),
      role: "user",
      text: prompt,
      type: messageType,
      ...(image && {
        body: {
          type: AttachmentType.Image,
          image: image.imagePreview,
        },
      }),
    });
  };

  return (
    <div className="h-[calc(100dvh-80px)] grid grid-rows-[1fr_auto] mx-5">
      <ScrollArea className="min-h-0 pr-3.5 -mr-3.5">
        {/* Chat messages */}
        <ChatMessageList />

        {/* AI Circle */}
        <div
          className="grid place-items-center"
          onClick={() => setOpenConfirmDialog(true)} 
        >
          <AiCircleIcon />
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="my-5 grid grid-cols-[1fr_auto] items-end gap-1">
        <ChatInput showPlaceholder={false} onSubmit={handleSubmit} />
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
