import {
  IntentType,
  type IntentResponse,
  type OperationInfo,
} from "@/shared/model/intents";
import { v4 as uuidv4 } from "uuid";
import { memo } from "react";
import { ChatMessageRole, ChatMessageType, useChatStore, type ChatMessage } from "@/features/chat";
import { ChatBuyBtcDialog } from "../ui/chat-buy-btc-dialog";
import { ChatMoneyTransferDialog } from "../ui/chat-money-transfer-dialog";
import { ChatScheduledMoneyTransferDialog } from "../ui/chat-scheduled-money-transfer-dialog";

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

export const ChatDialog = memo(
  ({ handleConfirm, handleClose }: ChatDialogProps) => {
    const dialog = useChatStore.use.dialog();
    const setDialog = useChatStore.use.setDialog();

    const { dialogIntent, open } = dialog;

    const onConfirm = (
      message: Partial<ChatMessage>,
      inputData: Record<string, string | number | boolean | object>
    ) => {
      if (!dialogIntent) return;

      const newMessage = {
        id: uuidv4(),
        type: ChatMessageType.SUCCESS,
        role: ChatMessageRole.AGENT,
        ...message,
      };
      const confirmInfo: OperationInfo = {
        intent: dialogIntent.intent,
        info: {
          ...getConfirmInfo(dialogIntent),
          ...inputData,
        },
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
          onConfirm={(inputData) =>
            onConfirm(
              {
                text: "Order completed. BTC transferred to your wallet.",
                intent: dialogIntent,
              },
              inputData
            )
          }
          onCancel={onCancel}
        />
      );
    }

    if (dialogIntent?.intent === IntentType.TRANSFER_MONEY) {
      return (
        <ChatMoneyTransferDialog
          data={dialogIntent.output}
          open={open}
          onConfirm={(inputData) =>
            onConfirm(
              {
                text: "Transfer done. Funds sent.",
                intent: dialogIntent,
              },
              inputData
            )
          }
          onCancel={onCancel}
        />
      );
    }

    if (dialogIntent?.intent === IntentType.SCHEDULED_TRANSFER) {
      return (
        <ChatScheduledMoneyTransferDialog
          data={dialogIntent.output}
          open={open}
          onConfirm={(inputData) =>
            onConfirm(
              {
                type: IntentType.SCHEDULED_TRANSFER,
                intent: {
                  ...dialogIntent,
                  output: {
                    ...dialogIntent.output,
                    transfer_details: {
                      ...dialogIntent.output.transfer_details,
                      ...inputData,
                    },
                  },
                },
              },
              inputData
            )
          }
          onCancel={onCancel}
        />
      );
    }

    return null;
  }
);
