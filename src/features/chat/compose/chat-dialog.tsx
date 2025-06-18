import { IntentType } from "@/shared/model/intents";
import { useChatStore, type ChatMessage } from "../model/chat-store";
import { ChatBuyBtcDialog } from "./dialogs/chat-buy-btc-dialog";
import { ChatMoneyTransferDialog } from "./dialogs/chat-money-transfer-dialog";
import { v4 as uuidv4 } from "uuid";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { ChatMessageType } from "../model/chat-store";
import { ChatMessageRole } from "../model/chat-store";
import { ChatScheduledMoneyTransferDialog } from "./dialogs/chat-scheduled-money-transfer-dialog";

interface ChatDialogProps {
  onNewMessage?: (message: ChatMessage) => void;
}

export function ChatDialog({ onNewMessage }: ChatDialogProps) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const dialog = useChatStore.use.dialog();
  const setDialog = useChatStore.use.setDialog();
  const addMessage = useChatStore.use.addMessage();

  const { dialogIntent, open } = dialog;

  const handleActionButtonClick = (message: Partial<ChatMessage>) => {
    if (!chatId) return;

    const newMessage = {
      id: uuidv4(),
      type: ChatMessageType.SUCCESS,
      role: ChatMessageRole.AGENT,
      ...message,
    };

    addMessage(chatId, newMessage);
    onNewMessage?.(newMessage);
    setDialog(false, null);
  };

  if (dialogIntent?.intent === IntentType.BUY_BTC) {
    return (
      <ChatBuyBtcDialog
        data={dialogIntent.output}
        open={open}
        onActionButtonClick={() =>
          handleActionButtonClick({
            text: "Order completed. BTC transferred to your wallet.",
          })
        }
        onCancelButtonClick={() => setDialog(false, null)}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.TRANSFER_MONEY) {
    return (
      <ChatMoneyTransferDialog
        data={dialogIntent.output}
        open={open}
        onActionButtonClick={() =>
          handleActionButtonClick({
            text: "Transfer done. Funds sent.",
          })
        }
        onCancelButtonClick={() => setDialog(false, null)}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.SCHEDULED_TRANSFER) {
    return (
      <ChatScheduledMoneyTransferDialog
        data={dialogIntent.output}
        open={open}
        onActionButtonClick={() =>
          handleActionButtonClick({
            type: IntentType.SCHEDULED_TRANSFER,
            intent: dialogIntent,
          })
        }
        onCancelButtonClick={() => setDialog(false, null)}
      />
    );
  }

  return null;
}
