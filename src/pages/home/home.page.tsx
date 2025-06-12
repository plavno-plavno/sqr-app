import {
  ActionsCarousel,
  actionsMock,
  type QuickAction,
} from "@/features/actions";
import { ChatInput, ChatMessageType, useChatStore } from "@/features/chat";
import {
  LastTransactionsCarousel,
  lastTransactionsMock,
} from "@/features/transactions";
import { ROUTES } from "@/shared/model/routes";
import { AiCircleIcon } from "@/shared/ui/icons/AiCircleIcon";
import { Button } from "@/shared/ui/kit/button";
import { v4 as uuidv4 } from "uuid";
import { href, Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const createChat = useChatStore.use.createChat();
  const addMessage = useChatStore.use.addMessage();
  const navigate = useNavigate();

  const handleSubmit = (prompt: string) => {
    const chatId = uuidv4();
    createChat(chatId, prompt);
    addMessage(chatId, {
      id: uuidv4(),
      role: "user",
      text: prompt,
      type: ChatMessageType.Text,
    });
    navigate(href(ROUTES.CHAT, { chatId }));
  };

  const handleQuickActionClick = (action: QuickAction) => {
    const chatId = uuidv4();
    createChat(chatId, action.name);
    addMessage(chatId, {
      id: uuidv4(),
      role: "user",
      text: action.prompt,
      type: ChatMessageType.Text,
    });
    navigate(href(ROUTES.CHAT, { chatId }));
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full px-5">
      {/* Balance */}
      <div className="flex flex-col gap-1 pt-8">
        <p className="text-sm text-foreground/50 font-semibold">Your balance</p>
        <h3 className="text-[32px] font-semibold">$5060,45</h3>
      </div>

      {/* AI Circle */}
      <div className="grid place-items-center">
        <AiCircleIcon />
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
      <ChatInput className="my-8" onSubmit={handleSubmit} />
    </div>
  );
};

export const Component = HomePage;
