import {
  lastTransactionsMock,
  TransactionsList,
} from "@/features/transactions";
import { BackHeaderButton, Header } from "@/shared/ui/header";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";

const PaymentsPage = () => {
  return (
    <div className="mx-5 grid h-full">
      <Header leftElement={<BackHeaderButton />} title="Payments" />
      <ScrollArea className="my-4.5 pr-3.5 -mr-3.5 min-h-0">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium text-foreground/50">
            Expenses for <span className="text-foreground">April</span>
          </p>
          <p className="text-2xl font-semibold">$1403.50</p>
        </div>

        <TransactionsList transactions={lastTransactionsMock} />
      </ScrollArea>
    </div>
  );
};

export const Component = PaymentsPage;
