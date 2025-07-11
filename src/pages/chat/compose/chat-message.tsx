import { IntentType } from "@/shared/model/intents";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { Link, useParams } from "react-router-dom";
import { useWSConnection } from "@/features/ws-connection";
import {
  AttachmentType,
  ChatButtonsList,
  ChatContactsMessage,
  ChatImageMessage,
  ChatLineChartMessage,
  ChatMessageRole,
  ChatMessageType,
  ChatMoneyInfoMessage,
  ChatMoneyTransferMessage,
  ChatPieChartMessage,
  ChatSpendingInsightsMessage,
  ChatSuccessMessage,
  ChatTextMessage,
  PeriodType,
  useChatStore,
  type ChatMessage,
  type PieChartConfig,
} from "@/features/chat";
import {
  ContactsCarousel,
  contactsMock,
  ContactsSearch,
  type Contact,
} from "@/features/contacts";
import { abilitiesMock } from "@/features/actions";
import { Button } from "@/shared/ui/kit/button";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const { isConnected, sendTextCommand } = useWSConnection();
  const addMessage = useChatStore.use.addMessage();
  const { text, type, role, body, intent } = message;

  const handleContactClick = (contact: Contact) => {
    sendTextCommand(
      `Please transfer 1$ to ${contact.name}. Phone number is ${contact.phone}.`
    );
  };

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

  if (
    type === ChatMessageType.SUCCESS &&
    text &&
    intent?.intent === IntentType.BUY_BTC
  ) {
    return (
      <ChatSuccessMessage text={text}>
        <Button asChild size="default" className="w-fit">
          <Link to={ROUTES.INVEST}>View investments</Link>
        </Button>
      </ChatSuccessMessage>
    );
  }

  if (type === ChatMessageType.SUCCESS && text) {
    return <ChatSuccessMessage text={text} />;
  }

  if (type === ChatMessageType.CONTACTS) {
    return (
      <ChatContactsMessage>
        <ContactsCarousel
          contacts={contactsMock}
          disabled={!isConnected}
          onContactClick={handleContactClick}
        />
        <ContactsSearch
          contacts={contactsMock}
          disabled={!isConnected}
          onContactClick={handleContactClick}
        />
      </ChatContactsMessage>
    );
  }

  if (type === IntentType.ABILITIES) {
    return (
      <>
        <ChatTextMessage
          text="Sure, here's a list of possibilities:"
          role={ChatMessageRole.AGENT}
        />
        <ChatButtonsList
          list={abilitiesMock()}
          disabled={!isConnected}
          onItemClick={(action) => {
            if (action.messages) {
              action.messages.forEach((message) => {
                addMessage(chatId!, message);
              });
            }

            if (action.prompt) {
              sendTextCommand(action.prompt);
            }
          }}
        />
      </>
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
          title="Your current balance"
          amount={budget_summary?.available_balance?.toString()}
        />
        <ChatMoneyInfoMessage
          title="To stay within budget, you need to spend per day"
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
      <ChatSpendingInsightsMessage
        chatId={chatId!}
        message={message}
        spendingInsights={intent.output}
        chartElement={
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
        }
      />
    );
  }

  if (
    type === IntentType.SPENDING_ANALYTICS &&
    intent?.intent === IntentType.SPENDING_ANALYTICS
  ) {
    const { spending_analysis } = intent.output;

    return (
      <div className="flex flex-col gap-4">
        {text && <ChatTextMessage text={text} role={role} />}
        <div className="flex flex-col gap-2">
          {spending_analysis?.categories?.map((category, index) => (
            <ChatMoneyInfoMessage
              key={index}
              title={category?.name}
              amount={`${category?.amount?.toFixed(2)}`}
              trend={category?.trend}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === ChatMessageType.HIDDEN) {
    return null;
  }

  return (
    <p className="text-2xl">
      Unknown message type or intent: {type}, {intent?.intent}
    </p>
  );
}
