import { createSelectors } from "@/shared/lib/js/zustand";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { investMock, type Investment } from "./investment";

interface State {
  investments: Investment[];
  change: number;
}

interface Actions {
  addInvestment: (investment: Investment) => void;
  removeInvestment: (investmentId: string) => void;
  updateInvestment: (
    investmentId: string,
    updates: Partial<Investment>
  ) => void;
  buyCoins: (coinData: Partial<Investment>) => void;
  getTotalValueInUSD: () => number;
}

type Store = State & Actions;

const useInvestmentStoreBase = create<Store>()(
  persist(
    immer((set, get) => ({
      investments: investMock,
      change: 0.45,

      addInvestment: (investment: Investment) =>
        set((state) => {
          state.investments.push(investment);
        }),

      removeInvestment: (investmentId: string) =>
        set((state) => {
          const index = state.investments.findIndex(
            (investment) => investment.id === investmentId
          );
          if (index !== -1) {
            state.investments.splice(index, 1);
          }
        }),

      updateInvestment: (investmentId: string, updates: Partial<Investment>) =>
        set((state) => {
          const investment = state.investments.find(
            (inv) => inv.id === investmentId
          );
          if (investment) {
            Object.assign(investment, updates);
          }
        }),

      buyCoins: (coinData: Partial<Investment>) =>
        set((state) => {
          console.log(coinData);
          // Check if investment with this symbol already exists
          const existingInvestment = state.investments.find(
            (inv) => inv.symbol === coinData?.symbol
          );

          if (existingInvestment) {
            // Add to existing investment
            existingInvestment.amount += coinData?.amount || 0;
          } else {
            // Create new investment
            const newInvestment: Investment = {
              id: uuidv4(),
              symbol: coinData?.symbol || "",
              currency: coinData?.symbol || "",
              amount: coinData?.amount || 0,
              name: coinData?.name || coinData?.symbol || "",
              rate: coinData?.rate || 1.0,
              changePercent: Math.random() - 0.5, // Generate random percent between -0.5 and 0.5
            };
            state.investments.push(newInvestment);
          }
        }),

      getTotalValueInUSD: () =>
        get().investments.reduce(
          (total, investment) => total + investment.amount * investment.rate,
          0
        ),
    })),
    {
      name: "investment-store",
    }
  )
);

export const useInvestmentStore = createSelectors(useInvestmentStoreBase);
