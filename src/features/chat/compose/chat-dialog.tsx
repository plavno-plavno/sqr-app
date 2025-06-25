import {
  IntentType,
  type IntentResponse,
  type OperationInfo,
} from "@/shared/model/intents";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "../model/chat-store";
import { ChatBuyBtcDialog } from "./dialogs/chat-buy-btc-dialog";
import { ChatMoneyTransferDialog } from "./dialogs/chat-money-transfer-dialog";
import { ChatScheduledMoneyTransferDialog } from "./dialogs/chat-scheduled-money-transfer-dialog";

interface ChatDialogProps {
  handleConfirm?: (message: ChatMessage, intent: OperationInfo) => void;
  handleClose?: () => void;
}

const getConfirmInfo = (intent: IntentResponse) => {
  const { output, intent: intentType } = intent;

  switch (intentType) {
    case IntentType.BUY_BTC:
      return output.purchase_details;
    case IntentType.TRANSFER_MONEY:
      return output.transfer_details;
    case IntentType.SCHEDULED_TRANSFER:
      return output.transfer_details;
    default:
      return {};
  }
};

export function ChatDialog({ handleConfirm, handleClose }: ChatDialogProps) {
  const dialog = useChatStore.use.dialog();
  const setDialog = useChatStore.use.setDialog();

  const { dialogIntent, open } = dialog;

  const onConfirm = (
    message: Partial<ChatMessage>,
    confirmInfo: OperationInfo
  ) => {
    if (!dialogIntent) return;

    const newMessage = {
      id: uuidv4(),
      type: ChatMessageType.SUCCESS,
      role: ChatMessageRole.AGENT,
      ...message,
    };

    handleConfirm?.(newMessage, confirmInfo);
    setDialog(false, null);
  };

  const onCancel = () => {
    setDialog(false, null);
    handleClose?.();
  };

  if (dialogIntent?.intent === IntentType.BUY_BTC) {
    return (
      <ChatBuyBtcDialog
        data={dialogIntent.output}
        open={open}
        onConfirm={(inputData) => {
          const confirmInfo: OperationInfo = {
            intent: dialogIntent.intent,
            info: {
              ...getConfirmInfo(dialogIntent),
              ...inputData,
            },
          };

          onConfirm(
            {
              text: "Order completed. BTC transferred to your wallet.",
            },
            confirmInfo
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.TRANSFER_MONEY) {
    return (
      <ChatMoneyTransferDialog
        data={dialogIntent.output}
        open={open}
        onConfirm={() => {
          const confirmInfo: OperationInfo = {
            intent: dialogIntent.intent,
            info: getConfirmInfo(dialogIntent),
          };

          onConfirm(
            {
              text: "Transfer done. Funds sent.",
            },
            confirmInfo
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.SCHEDULED_TRANSFER) {
    return (
      <ChatScheduledMoneyTransferDialog
        data={dialogIntent.output}
        open={open}
        onConfirm={() => {
          const confirmInfo: OperationInfo = {
            intent: dialogIntent.intent,
            info: getConfirmInfo(dialogIntent),
          };

          onConfirm(
            {
              type: IntentType.SCHEDULED_TRANSFER,
              intent: dialogIntent,
            },
            confirmInfo
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  return null;
}
