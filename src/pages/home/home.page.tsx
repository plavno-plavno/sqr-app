import {
  ActionsCarousel,
  quickActionsMock,
  type ActionType,
} from "@/features/actions";
import {
  AttachmentType,
  ChatInput,
  ChatMessageType,
  ChatMessageRole,
  useChatStore,
  type ImageState,
} from "@/features/chat";
import { LastTransactionsCarousel, useTransactionStore } from "@/features/transactions";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import Lottie from "lottie-react";
import { href, Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import sphere from "@/shared/assets/animations/sphere.json";
import { Header, NewChatHeaderButton } from "@/shared/ui/header";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";
import { useFinanceStore } from "@/features/finance";
import { formatNumber } from "@/shared/lib/js/numbers";

const HomePage = () => {
  const balance = useFinanceStore.use.balance();
  const transactions = useTransactionStore.use.transactions();
  const createChat = useChatStore.use.createChat();
  const addMessage = useChatStore.use.addMessage();
  const navigate = useNavigate();

  const handleSubmit = (prompt: string, image?: ImageState) => {
    const chatId = uuidv4();
    createChat(chatId, prompt);
    addMessage(chatId, {
      id: uuidv4(),
      role: ChatMessageRole.USER_TEXT,
      text: prompt,
      type: ChatMessageType.TEXT,
      ...(image && {
        body: {
          type: AttachmentType.IMAGE,
          image: image.imagePreview,
        },
      }),
    });

    const queryParams = new URLSearchParams();
    queryParams.set("prompt", prompt);
    navigate(`${href(ROUTES.CHAT, { chatId })}?${queryParams.toString()}`);
  };

  const handleQuickActionClick = (action: ActionType) => {
    const chatId = uuidv4();
    createChat(chatId, action.name);

    if (action.messages) {
      action.messages.forEach((message) => {
        addMessage(chatId, message);
      });
    }

    const queryParams = new URLSearchParams();
    if (action.prompt) {
      queryParams.set("prompt", action.prompt);
    }
    navigate(`${href(ROUTES.CHAT, { chatId })}?${queryParams.toString()}`);
  };

  const handleMicClick = () => {
    const chatId = uuidv4();
    createChat(chatId);

    const queryParams = new URLSearchParams();
    queryParams.set("mic", "true");
    navigate(`${href(ROUTES.CHAT, { chatId })}?${queryParams.toString()}`);
  };

  const handleNewChatClick = () => {
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.CHAT, { chatId })}`);
  };

  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] h-full px-5">
      {/* Header */}
      <Header
        leftElement={<SidebarTrigger />}
        rightElement={<NewChatHeaderButton onClick={handleNewChatClick} />}
      />

      {/* Balance */}
      <div className="flex flex-col gap-1 pt-4.5">
        <p className="text-sm text-foreground/50 font-semibold">Your balance</p>
        <h3 className="text-[32px] font-semibold">
          ${formatNumber(balance, 2)}
        </h3>
      </div>

      {/* AI Circle */}
      <div className="grid place-items-center" onClick={handleMicClick}>
        <Lottie animationData={sphere} />
      </div>

      {/* Last transactions */}
      <div className="flex justify-between">
        <p className="text-base text-foreground/50 font-semibold">
          Last transactions
        </p>

        <Button
          className="text-base text-foreground font-semibold p-0 h-auto"
          variant="link"
          asChild
        >
          <Link to={ROUTES.PAYMENTS}>Show All</Link>
        </Button>
      </div>

      {/* Last transactions carousel */}
      <LastTransactionsCarousel
        className="mt-4"
        transactions={transactions}
      />

      {/* Actions carousel */}
      <ActionsCarousel
        className="mt-5.5"
        actions={quickActionsMock()}
        onCardClick={handleQuickActionClick}
      />

      {/* Chat input */}
      <ChatInput
        className="my-8"
        onSubmit={handleSubmit}
        onMicClick={handleMicClick}
      />
    </div>
  );
};

export const Component = HomePage;
