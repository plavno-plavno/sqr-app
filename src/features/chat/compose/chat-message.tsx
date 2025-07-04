import { IntentType } from "@/shared/model/intents";
import { type PieChartConfig } from "../model/chart";
import {
  AttachmentType,
  ChatMessageRole,
  ChatMessageType,
  useChatStore,
  type ChatMessage,
} from "../model/chat-store";
import { ChatImageMessage } from "../ui/chat-messages/chat-image-message";
import { ChatInfoListMessage } from "../ui/chat-messages/chat-info-list-message";
import {
  ChatLineChartMessage,
  PeriodType,
} from "../ui/chat-messages/chat-line-chart-message";
import { ChatMoneyInfoMessage } from "../ui/chat-messages/chat-money-info-message";
import { ChatMoneyTransferMessage } from "../ui/chat-messages/chat-money-transfer-message";
import { ChatPieChartMessage } from "../ui/chat-messages/chat-pie-chart-message";
import { ChatSuccessMessage } from "../ui/chat-messages/chat-success-message";
import { ChatTextMessage } from "../ui/chat-messages/chat-text-message";
import { v4 as uuidv4 } from "uuid";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { useWebSocketStore } from "../model/websocket-store";

interface ChatMessageProps {
  message: ChatMessage;
}

const mapIntentToAbilityMessage = {
  [IntentType.ABILITIES]: "Show me all your abilities",
  [IntentType.BTC_PRICE]: "Show me the current price of Bitcoin",
  [IntentType.BUY_BTC]: "I want to buy a Bitcoin",
  [IntentType.DAILY_BUDGET]: "Setup my daily budget",
  [IntentType.SCHEDULED_TRANSFER]: "Transfer money to my friend at given time",
  [IntentType.SPENDING_INSIGHTS]: "Where my money is going?",
  [IntentType.SPENDING_ANALYTICS]: "Show my spending analytics for whole year",
  [IntentType.TRANSFER_MONEY]: "Transfer money to my friend",
};

export function ChatMessage({ message }: ChatMessageProps) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const addMessage = useChatStore.use.addMessage();
  const connection = useWebSocketStore.use.connection();
  const { text, type, role, body, intent } = message;

  if (body?.type === AttachmentType.IMAGE && body.image) {
    if (type === ChatMessageType.TEXT && text && text.length > 0) {
      return (
        <>
          <ChatTextMessage text={text} role={role} />
          <ChatImageMessage image={body.image} />
        </>
      );
    }

    return <ChatImageMessage image={body.image} />;
  }

  if (type === ChatMessageType.TEXT && text) {
    return <ChatTextMessage text={text} role={role} />;
  }

  if (type === ChatMessageType.SUCCESS && text) {
    return <ChatSuccessMessage text={text} />;
  }

  if (
    type === IntentType.ABILITIES &&
    intent?.intent === IntentType.ABILITIES
  ) {
    return (
      <ChatInfoListMessage
        list={intent.output?.abilities?.map((ability) => ({
          title: ability?.intent_name,
          description: ability?.description,
          message:
            mapIntentToAbilityMessage[ability?.intent_name as IntentType],
        }))}
        onItemClick={(item) => {
          addMessage(chatId!, {
            id: uuidv4(),
            type: ChatMessageType.TEXT,
            text: item.message,
            role: ChatMessageRole.USER_TEXT,
          });
          connection?.sendTextCommand(item.message);
        }}
      />
    );
  }

  if (
    type === IntentType.BTC_PRICE &&
    intent?.intent === IntentType.BTC_PRICE
  ) {
    const { current_price, price_points } = intent.output;
    return (
      <ChatLineChartMessage
        currentPrice={current_price}
        chartData={price_points}
        period={PeriodType.SINGLE}
        valueKey="price"
        xAxisKey="timestamp"
        yAxisKey="price"
      />
    );
  }

  if (
    type === IntentType.SCHEDULED_TRANSFER &&
    intent?.intent === IntentType.SCHEDULED_TRANSFER
  ) {
    const { transfer_details } = intent.output;
    return (
      <ChatMoneyTransferMessage
        amount={`$${transfer_details?.amount?.toFixed(2)}`}
        recipient={transfer_details?.recipient}
        date={new Date(transfer_details?.scheduled_time)}
      />
    );
  }

  if (
    type === IntentType.DAILY_BUDGET &&
    intent?.intent === IntentType.DAILY_BUDGET
  ) {
    const { budget_summary } = intent.output;
    return (
      <div className="flex flex-col gap-2">
        <ChatMoneyInfoMessage
          description="Your current balance"
          amount={budget_summary?.available_balance?.toString()}
        />
        <ChatMoneyInfoMessage
          description="To stay within budget, you need to spend per day"
          amount={budget_summary?.daily_limit?.toString()}
        />
      </div>
    );
  }

  if (
    type === IntentType.SPENDING_INSIGHTS &&
    intent?.intent === IntentType.SPENDING_INSIGHTS
  ) {
    const { summary, top_categories } = intent.output;
    return (
      <ChatPieChartMessage
        title="Expenses for"
        titleBoldPart={summary?.month}
        chartData={top_categories}
        amount={summary?.total_spent?.toString()}
        chartConfig={top_categories?.reduce((acc, category, index) => {
          acc[category?.category] = {
            label: category?.category,
            color: `var(--chart-${index + 1})`,
          };
          return acc;
        }, {} as PieChartConfig)}
        dataKey="amount"
        nameKey="category"
        valueSign="$"
      />
    );
  }

  if (
    type === IntentType.SPENDING_ANALYTICS &&
    intent?.intent === IntentType.SPENDING_ANALYTICS
  ) {
    const { comparison, summary, insights } = intent.output;

    return (
      <div className="flex flex-col gap-2">
        {comparison?.previous_month?.categories?.map((category, index) => (
          <ChatMoneyInfoMessage
            key={index}
            description={
              insights?.[index]?.message || summary?.key_findings?.[index]
            }
            amount={`${category?.amount?.toFixed(2)}`}
            category={category?.name}
          />
        ))}
      </div>
    );
  }

  return (
    <p className="text-2xl">
      Unknown message type or intent: {type}, {intent?.intent}
    </p>
  );
}
