import {
  ActionsCarousel,
  actionsMock,
  type QuickAction,
} from "@/features/actions";
import {
  AttachmentType,
  ChatInput,
  ChatMessageType,
  ChatMessageRole,
  useChatStore,
  type ImageState,
} from "@/features/chat";
import {
  LastTransactionsCarousel,
  lastTransactionsMock,
} from "@/features/transactions";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import Lottie from "lottie-react";
import { href, Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import sphere from "@/shared/assets/animations/sphere.json";
import { Header, NewChatHeaderButton } from "@/shared/ui/header";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const HomePage = () => {
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
    navigate(`${href(ROUTES.CHAT, { chatId })}?message=${prompt}`);
  };

  const handleQuickActionClick = (action: QuickAction) => {
    const chatId = uuidv4();
    createChat(chatId, action.name);
    addMessage(chatId, {
      id: uuidv4(),
      role: ChatMessageRole.USER_TEXT,
      text: action.prompt,
      type: ChatMessageType.TEXT,
    });
    navigate(`${href(ROUTES.CHAT, { chatId })}?message=${action.prompt}`);
  };

  const handleMicClick = () => {
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.CHAT, { chatId })}?mic=true`);
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
        <h3 className="text-[32px] font-semibold">$5060,45</h3>
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
        transactions={lastTransactionsMock}
      />

      {/* Actions carousel */}
      <ActionsCarousel
        className="mt-5.5"
        actions={actionsMock}
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
