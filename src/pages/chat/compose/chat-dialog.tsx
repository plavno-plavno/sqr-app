import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "@/features/chat";
import { getRandomDetails, useTransactionStore } from "@/features/transactions";
import { useAudio, useWSConnection } from "@/features/ws-connection";
import {
  IntentType,
  type IntentResponse,
  type OperationInfo,
  type TransferMoneyOutput,
} from "@/shared/model/intents";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { memo } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { ChatBuyBtcDialog } from "../ui/chat-buy-btc-dialog";
import {
  ChatMoneyTransferDialog,
  type MoneyTransferConfirmData,
} from "../ui/chat-money-transfer-dialog";
import { ChatScheduledMoneyTransferDialog } from "../ui/chat-scheduled-money-transfer-dialog";
import { useFinanceStore } from "@/features/finance";
import { useInvestmentStore } from "@/features/invest";

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

export const ChatDialog = memo(() => {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const subtractFromBalance = useFinanceStore.use.subtractFromBalance();
  const buyCoins = useInvestmentStore.use.buyCoins();
  const dialog = useChatStore.use.dialog();
  const setDialog = useChatStore.use.setDialog();
  const addTransaction = useTransactionStore.use.addTransaction();
  const addMessage = useChatStore.use.addMessage();

  const { dialogIntent, open } = dialog;

  const { sendConfirmationCommand } = useWSConnection();
  const { toggleMute } = useAudio();

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

    addMessage(chatId!, newMessage);
    sendConfirmationCommand(confirmInfo);
    setDialog(false, null);
    toggleMute(false);
  };

  const onCancel = () => {
    setDialog(false, null);
    toggleMute(false);
  };

  const handleTransaction = (inputData: MoneyTransferConfirmData) => {
    addTransaction({
      id: Date.now(),
      amount: inputData.amount || 0,
      date: new Date().toISOString(),
      details: [
        { name: "Recipient", value: inputData.recipient || "" },
        ...getRandomDetails(),
        {
          name: inputData.payment.paymentMethod,
          value: inputData.payment.identifier,
        },
      ],
    });
  };

  if (dialogIntent?.intent === IntentType.BUY_BTC) {
    return (
      <ChatBuyBtcDialog
        data={dialogIntent.output}
        open={open}
        onConfirm={(inputData) => {
          onConfirm(
            {
              text: "Order completed. BTC transferred to your wallet.",
              intent: dialogIntent,
            },
            inputData
          );
          subtractFromBalance(inputData.total_cost || 0);
          buyCoins("BTC", inputData.btc_amount || 0);
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
        onConfirm={(inputData) => {
          onConfirm(
            {
              text: "Transfer done. Funds sent.",
              intent: dialogIntent,
            },
            inputData
          );
          handleTransaction({
            ...(dialogIntent.output as TransferMoneyOutput).transfer_details,
            ...inputData,
          });
          subtractFromBalance(inputData.amount || 0);
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
        onConfirm={(inputData) => {
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
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  return null;
});
