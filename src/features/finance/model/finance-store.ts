import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const INITIAL_BALANCE = 33278.45;

interface State {
  balance: number;
}

interface Actions {
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => void;
  resetBalance: () => void;
}

type Store = State & Actions;

const useFinanceStoreBase = create<Store>()(
  persist(
    immer((set) => ({
      balance: INITIAL_BALANCE,

      addToBalance: (amount: number) =>
        set((state) => {
          state.balance += amount;
        }),

      subtractFromBalance: (amount: number) =>
        set((state) => {
          const newBalance = state.balance - amount;

          if (newBalance < 0) {
            state.balance = INITIAL_BALANCE;
          } else {
            state.balance = newBalance;
          }
        }),

      resetBalance: () =>
        set((state) => {
          state.balance = INITIAL_BALANCE;
        }),
    })),
    {
      name: "finance-store",
    }
  )
);

export const useFinanceStore = createSelectors(useFinanceStoreBase);
