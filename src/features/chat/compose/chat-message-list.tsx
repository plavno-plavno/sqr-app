import { cn } from "@/shared/lib/css/tailwind";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../model/chat-store";
import { ChatConfirmDialog } from "../ui/chat-confirm-dialog";
import {
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardBuy
} from "../ui/chat-dialog-cards/chat-dialog-action-card";
import { ChatDialogPaymentCard } from "../ui/chat-dialog-cards/chat-dialog-payment-card";
import { ChatMessage } from "./chat-message";

export function ChatMessageList({ className }: { className?: string }) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const chats = useChatStore.use.chats();
  const messages = chats[chatId as string]?.messages;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {messages?.map((message) => (
        <div key={message.id} onClick={() => setOpenConfirmDialog(true)}>
          <ChatMessage key={message.id} message={message} />
        </div>
      ))}

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
          /> */}
          {/* <ChatDialogActionCardRecipient
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
}
