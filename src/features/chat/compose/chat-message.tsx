import { IntentType } from "@/shared/model/intents";
import {
  AttachmentType,
  ChatMessageType,
  type ChatMessage,
} from "../model/chat-store";
import { ChatImageMessage } from "../ui/chat-messages/chat-image-message";
import { ChatTextMessage } from "../ui/chat-messages/chat-text-message";
import { ChatSuccessMessage } from "../ui/chat-messages/chat-success-message";
import { ChatPieChartMessage } from "../ui/chat-messages/chat-pie-chart-message";
import type { PieChartConfig } from "../model/chart";
import { ChatMoneyInfoMessage } from "../ui/chat-messages/chat-money-info-message";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { text, type, role, body, intent } = message;

  if (body?.type === AttachmentType.Image && body.image) {
    if (type === ChatMessageType.Text && text && text.length > 0) {
      return (
        <>
          <ChatTextMessage text={text} role={role} />
          <ChatImageMessage image={body.image} />
        </>
      );
    }

    return <ChatImageMessage image={body.image} />;
  }

  if (type === ChatMessageType.Text && text) {
    return <ChatTextMessage text={text} role={role} />;
  }

  if (type === ChatMessageType.Intent && intent) {
    if (intent.intent === IntentType.BUY_BTC && text) {
      return <ChatSuccessMessage text={text} />;
    }

    if (intent.intent === IntentType.SPENDING_INSIGHTS) {
      const { summary, top_categories } = intent.output;
      return (
        <ChatPieChartMessage
          title="Expenses for"
          titleBoldPart={summary.month}
          chartData={top_categories}
          amount={summary.total_spent.toString()}
          chartConfig={top_categories.reduce((acc, category, index) => {
            acc[category.category] = {
              label: category.category,
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

    if (intent.intent === IntentType.SPENDING_ANALYTICS) {
      const { comparison, summary } = intent.output;

      return (
        <div className="flex flex-col gap-2">
          {comparison.previous_month.categories.map((category, index) => (
            <ChatMoneyInfoMessage
              description={summary.key_findings[index]}
              amount={`$${category.amount.toFixed(2)}`}
              category={category.name}
            />
          ))}
        </div>
      );
    }

    if (intent.intent === IntentType.TRANSFER_MONEY) {
      const { summary } = intent.output;
      return <ChatSuccessMessage text={summary.message} />;
    }
  }

  return (
    <p className="text-2xl">
      Unknown message type or intent: {type}, {intent?.intent}
    </p>
  );
}
