import {
  TransactionsList,
  useTransactionStore,
} from "@/features/transactions";
import { BackHeaderButton, Header } from "@/shared/ui/header";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";

const PaymentsPage = () => {
  const getLastTransactions = useTransactionStore.use.getLastTransactions();
  const expenses = useTransactionStore.use.expenses();

  const latestTransactions = getLastTransactions(7);

  return (
    <div className="mx-5 grid grid-rows-[auto_1fr] h-full">
      <Header leftElement={<BackHeaderButton />} title="Payments" />
      <ScrollArea className="my-4.5 pr-3.5 -mr-3.5 min-h-0">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium text-foreground/50">
            Expenses for <span className="text-foreground">April</span>
          </p>
          <p className="text-2xl font-semibold">${expenses}</p>
        </div>

        <TransactionsList transactions={latestTransactions} />
      </ScrollArea>
    </div>
  );
};

export const Component = PaymentsPage;
