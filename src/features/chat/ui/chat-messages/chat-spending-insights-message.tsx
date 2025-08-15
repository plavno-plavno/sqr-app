import { cn } from "@/shared/lib/css/tailwind";
import type { SpendingInsightsOutput } from "@/shared/model/intents";
import { Button } from "@/shared/ui/kit/button";
import { ChatMessageRole, useChatStore, type ChatMessage } from "../..";
import { ChatSubscriptionMessage } from "./chat-subscription-message";
import { ChatTextMessage } from "./chat-text-message";

interface ChatSpendingInsightsMessageProps {
  chatId: string;
  message: ChatMessage;
  spendingInsights: Partial<SpendingInsightsOutput>;
  chartElement: React.ReactNode;
  className?: string;
}

export function ChatSpendingInsightsMessage({
  chatId,
  message,
  spendingInsights,
  chartElement,
  className,
}: ChatSpendingInsightsMessageProps) {
  const setSubscriptionsClicked = useChatStore.use.setSubscriptionsClicked();
  const setShowSubscriptions = useChatStore.use.setShowSubscriptions();

  const { subscriptionsClicked, showSubscriptions } = message;
  const { subscription_analysis } = spendingInsights;
  const hasSubscriptions =
    subscription_analysis &&
    (subscription_analysis.total_monthly ?? 0) > 0 &&
    (subscription_analysis.subscriptions?.length ?? 0) > 0;

  const handleSubscriptionsClick = (isDeactivate: boolean) => {
    setShowSubscriptions(chatId, message.id, isDeactivate);
    setSubscriptionsClicked(chatId, message.id, true);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {chartElement}

      {hasSubscriptions && (
        <>
          <ChatTextMessage
            role={ChatMessageRole.AGENT}
            text={`I also found you have hidden subscriptions that cost $${subscription_analysis?.total_monthly || 0} a month, want to look into it and disable them?`}
          />

          {!subscriptionsClicked && (
            <div className="flex gap-2">
              <Button
                className="min-w-27"
                onClick={() => handleSubscriptionsClick(true)}
              >
                Yes
              </Button>
              <Button
                variant="outline"
                className="min-w-27"
                onClick={() => handleSubscriptionsClick(false)}
              >
                No
              </Button>
            </div>
          )}
        </>
      )}

      {showSubscriptions &&
        subscription_analysis?.subscriptions?.map((subscription) => (
          <ChatSubscriptionMessage
            key={subscription?.name || "unknown"}
            title={subscription?.name || ""}
            amount={`$${Number(subscription?.amount || 0).toFixed(2)}`}
            period={subscription?.frequency || ""}
          />
        ))}
    </div>
  );
}
