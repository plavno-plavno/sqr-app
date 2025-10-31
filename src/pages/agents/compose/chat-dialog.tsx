import {
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "@/features/chat";
import { getRandomDetails, useTransactionStore } from "@/features/transactions";
import { useAudio } from "@/features/ws-connection";
import {
  IntentType,
  type IntentResponse,
  type OperationInfo,
  type TransferMoneyOutput,
} from "@/shared/model/intents";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { ChatBuyBtcDialog } from "../ui/chat-buy-btc-dialog";
import { ChatInvestDialog } from "../ui/chat-invest-dialog";
import {
  ChatMoneyTransferDialog,
  type MoneyTransferConfirmData,
} from "../ui/chat-money-transfer-dialog";
import { ChatScheduledMoneyTransferDialog } from "../ui/chat-scheduled-money-transfer-dialog";

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
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  const dialog = useChatStore.use.dialog();
  const setDialog = useChatStore.use.setDialog();
  const addTransaction = useTransactionStore.use.addTransaction();
  const addMessage = useChatStore.use.addMessage();

  const { dialogIntent, open } = dialog;
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
    console.log(confirmInfo);

    addMessage(chatId!, newMessage);
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
      amount: Number(inputData.amount || 0),
      date: new Date().toISOString(),
      details: [
        { name: t('chat.recipient'), value: inputData.recipient || "" },
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
        data={dialogIntent?.output}
        open={open}
        onConfirm={(inputData) => {
          onConfirm(
            {
              text: t('chat.orderCompleted', {
                amount: inputData.btc_amount,
                price: dialogIntent?.output?.market_info?.btc_price,
                total: inputData.total_cost,
                currency: dialogIntent?.output?.purchase_details?.currency || 'USD'
              }),
              intent: dialogIntent,
            },
            inputData
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.INVESTMENT) {
    const investmentDetails = dialogIntent?.output?.investment_details;
    return (
      <ChatInvestDialog
        data={dialogIntent?.output}
        open={open}
        onConfirm={(inputData) => {
          onConfirm(
            {
              text: t('chat.investmentCompleted', { 
                shares: inputData.shares_to_purchase, 
                symbol: investmentDetails?.stock_symbol, 
                amount: inputData.investment_amount, 
                currency: investmentDetails?.currency 
              }),
              intent: dialogIntent,
            },
            inputData
          );
        }}
        onCancel={onCancel}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.TRANSFER_MONEY) {
    return (
      <ChatMoneyTransferDialog
        data={dialogIntent?.output}
        open={open}
        onConfirm={(inputData) => {
          onConfirm(
            {
              text: t('chat.transferDone', {
                amount: inputData.amount,
                recipient: inputData.recipient,
                currency: dialogIntent?.output?.transfer_details?.currency || 'USD'
              }),
              intent: dialogIntent,
            },
            inputData
          );
          handleTransaction({
            ...(dialogIntent?.output as TransferMoneyOutput).transfer_details,
            ...inputData,
          });
        }}
        onCancel={onCancel}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.SCHEDULED_TRANSFER) {
    return (
      <ChatScheduledMoneyTransferDialog
        data={dialogIntent?.output}
        open={open}
        onConfirm={(inputData) => {
          onConfirm(
            {
              type: IntentType.SCHEDULED_TRANSFER,
              intent: {
                ...dialogIntent,
                output: {
                  ...dialogIntent?.output,
                  transfer_details: {
                    ...dialogIntent?.output?.transfer_details,
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
