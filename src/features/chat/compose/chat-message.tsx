import type { ChartConfig } from "@/shared/ui/kit/chart";
import { lineChartDataMock, pieChartDataMock } from "../model/chart";
import {
  AttachmentType,
  ChatMessageType,
  type ChatMessage,
} from "../model/chat-store";
import { ChatContactListMessage } from "../ui/chat-messages/chat-contact-list-message";
import { ChatLineChartMessage } from "../ui/chat-messages/chat-line-chart-message";
import { ChatMoneyInfoMessage } from "../ui/chat-messages/chat-money-info-message";
import { ChatMoneyTransferMessage } from "../ui/chat-messages/chat-money-transfer-message";
import { ChatPieChartMessage } from "../ui/chat-messages/chat-pie-chart-message";
import { ChatMoneySubscriptionMessage } from "../ui/chat-messages/chat-subscription-message";
import { ChatSuccessMessage } from "../ui/chat-messages/chat-success-message";
import { ChatTextMessage } from "../ui/chat-messages/chat-text-message";
import { ChatImageMessage } from "../ui/chat-messages/chat-image-message";
import { contactListMock } from "../model/contact";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { text, type, role, body } = message;

  if (body?.type === AttachmentType.Image && body.image) {
    if (type === ChatMessageType.Text && text.length > 0) {
      return (
        <>
          <ChatTextMessage text={text} role={role} />
          <ChatImageMessage image={body.image} />
        </>
      );
    }

    return <ChatImageMessage image={body.image} />;
  }

  if (type === ChatMessageType.Text) {
    return <ChatTextMessage text={text} role={role} />;
  }

  if (type === ChatMessageType.Success) {
    return <ChatSuccessMessage text={text} />;
  }

  if (type === ChatMessageType.LineChart) {
    return (
      <ChatLineChartMessage
        chartData={lineChartDataMock}
        valueKey="price"
        xAxisKey="date"
        yAxisKey="price"
      />
    );
  }

  if (type === ChatMessageType.PieChart) {
    return (
      <ChatPieChartMessage
        title="Expenses for"
        titleBoldPart="April"
        amount="1000.00"
        chartData={pieChartDataMock}
        chartConfig={
          {
            food: {
              label: "Food",
              color: "var(--chart-1)",
            },
            transport: {
              label: "Transport",
              color: "var(--chart-2)",
            },
            entertainment: {
              label: "Entertainment",
              color: "var(--chart-3)",
            },
            shopping: {
              label: "Shopping",
              color: "var(--chart-4)",
            },
            other: {
              label: "Other",
              color: "var(--chart-5)",
            },
          } satisfies ChartConfig
        }
        dataKey="amount"
        nameKey="category"
        valueSign="$"
      />
    );
  }

  if (type === ChatMessageType.ContactList) {
    return <ChatContactListMessage contacts={contactListMock} />;
  }

  if (type === ChatMessageType.MoneyInfo) {
    return <ChatMoneyInfoMessage title={text} amount="$550.00" />;
  }

  if (type === ChatMessageType.MoneyTransfer) {
    return (
      <ChatMoneyTransferMessage
        amount={"$1250.00"}
        recipient={"John Doe"}
        phone={"+1234567890"}
        date={new Date()}
      />
    );
  }

  if (type === ChatMessageType.Subscription) {
    return (
      <ChatMoneySubscriptionMessage title={text} amount="$33" period="month" />
    );
  }

  return <p className="text-2xl">Unknown message type: {type}</p>;
}
