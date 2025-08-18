import { IntentType } from "@/shared/model/intents";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { Link, useParams } from "react-router-dom";
import { useWSConnection } from "@/features/ws-connection";
import { useTranslation } from "react-i18next";
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
import { isNonEmptyObject } from "@/shared/lib/js/common";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { t } = useTranslation();
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const { isConnected, sendTextCommand } = useWSConnection();
  const addMessage = useChatStore.use.addMessage();
  const { text, type, role, body, intent } = message;

  const handleContactClick = (contact: Contact) => {
    sendTextCommand(
      t('chat.transferRequest', { name: contact.name, phone: contact.phone })
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
    (intent?.intent === IntentType.BUY_BTC ||
      intent?.intent === IntentType.INVESTMENT)
  ) {
    return (
      <ChatSuccessMessage text={text}>
        <Button asChild size="default" className="w-fit">
          <Link to={ROUTES.INVEST}>{t('chat.viewInvestments')}</Link>
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
          text={t('chat.abilitiesIntro')}
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
    if (!isNonEmptyObject(intent?.output)) return null;

    return (
      <ChatLineChartMessage
        currentPrice={intent?.output?.current_price || 0}
        chartData={intent?.output?.price_points || []}
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
    if (!isNonEmptyObject(intent?.output)) return null;

    const transferDetails = intent?.output?.transfer_details;
    return (
      <ChatMoneyTransferMessage
        amount={`$${Number(transferDetails?.amount || 0).toFixed(2)}`}
        recipient={transferDetails?.recipient || ""}
        date={new Date(transferDetails?.scheduled_time || new Date())}
      />
    );
  }

  if (
    type === IntentType.DAILY_BUDGET &&
    intent?.intent === IntentType.DAILY_BUDGET
  ) {
    if (!isNonEmptyObject(intent?.output)) return null;

    const budgetSummary = intent?.output?.budget_summary;
    return (
      <div className="flex flex-col gap-2">
        <ChatMoneyInfoMessage
          title={t('chat.currentBalance')}
          amount={budgetSummary?.available_balance?.toString() || "0"}
        />
        <ChatMoneyInfoMessage
          title={t('chat.dailyBudgetLimit')}
          amount={budgetSummary?.daily_limit?.toString() || "0"}
        />
      </div>
    );
  }

  if (
    type === IntentType.SPENDING_INSIGHTS &&
    intent?.intent === IntentType.SPENDING_INSIGHTS
  ) {
    if (!isNonEmptyObject(intent?.output)) return null;

    const summary = intent?.output?.summary;
    const categories = intent?.output?.top_categories;
    return (
      <ChatSpendingInsightsMessage
        chatId={chatId!}
        message={message}
        spendingInsights={intent?.output}
        chartElement={
          <ChatPieChartMessage
            title={t('chat.expensesFor')}
            titleBoldPart={summary?.month || ""}
            chartData={categories || []}
            amount={summary?.total_spent?.toString() || "0"}
            chartConfig={
              categories?.reduce((acc, category, index) => {
                if (category?.category) {
                  acc[category.category] = {
                    label: category.category,
                    color: `var(--chart-${index + 1})`,
                  };
                }
                return acc;
              }, {} as PieChartConfig) || {}
            }
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
    if (!isNonEmptyObject(intent?.output)) return null;

    const spending_analysis = intent?.output?.spending_analysis;
    return (
      <div className="flex flex-col gap-2">
        {spending_analysis?.categories?.map((category, index) => (
          <ChatMoneyInfoMessage
            key={index}
            title={category?.name || ""}
            amount={`${Number(category?.amount || 0).toFixed(2)}`}
            trend={category?.trend}
          />
        ))}
      </div>
    );
  }

  if (intent?.intent === IntentType.NONE || type === ChatMessageType.HIDDEN)
    return null;

  return (
    <p className="text-2xl">
      {t('chat.unknownMessage', { type, intent: intent?.intent })}
    </p>
  );
}
