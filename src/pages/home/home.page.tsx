import { ActionsCarousel } from "@/features/actions";
import { ChatInput } from "@/features/chat";
import { LastTransactionsCarousel } from "@/features/transactions";
import { AiCircleIcon } from "@/shared/ui/icons/AiCircleIcon";
import { Button } from "@/shared/ui/kit/button";

const HomePage = () => {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full mx-5">
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
        >
          Show All
        </Button>
      </div>

      {/* Last transactions carousel */}
      <LastTransactionsCarousel className="mt-4" />

      {/* Actions carousel */}
      <ActionsCarousel className="mt-5.5" />

      {/* Chat input */}
      <ChatInput className="my-8" />
    </div>
  );
};

export const Component = HomePage;
