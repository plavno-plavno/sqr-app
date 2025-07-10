import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { lastTransactionsMock, type Transaction } from "./transaction";

interface State {
  transactions: Transaction[];
  expenses: number;
}

interface Actions {
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (transactionId: number) => void;
  getLastTransactions: (count?: number) => Transaction[];
}

type Store = State & Actions;

const useTransactionStoreBase = create<Store>()(
  persist(
    immer((set, get) => ({
      transactions: lastTransactionsMock.slice(0, 3),
      expenses: lastTransactionsMock
        .slice(0, 3)
        .reduce((acc, transaction) => acc + transaction.amount, 0),

      addTransaction: (transaction: Transaction) =>
        set((state) => {
          state.transactions.unshift(transaction);
          state.expenses += transaction.amount;
        }),

      removeTransaction: (transactionId: number) =>
        set((state) => {
          const index = state.transactions.findIndex(
            (t) => t.id === transactionId
          );
          if (index !== -1) {
            const transaction = state.transactions[index];
            state.transactions.splice(index, 1);
            state.expenses -= transaction.amount;
          }
        }),

      getLastTransactions: (count = 7) =>
        get()
          .transactions.slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, count),
    })),
    {
      name: "transaction-store",
    }
  )
);

export const useTransactionStore = createSelectors(useTransactionStoreBase);
