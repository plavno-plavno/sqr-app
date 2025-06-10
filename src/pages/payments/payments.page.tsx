import {
  lastTransactionsMock,
  TransactionsList
} from "@/features/transactions";

const PaymentsPage = () => {
  return (
    <div className="my-9 px-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-foreground/50">
          Expenses for <span className="text-foreground">April</span>
        </p>
        <p className="text-2xl font-semibold">$1403.50</p>
      </div>

      <TransactionsList transactions={lastTransactionsMock} />
    </div>
  );
};

export const Component = PaymentsPage;
