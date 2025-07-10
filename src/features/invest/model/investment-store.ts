import { createSelectors } from "@/shared/lib/js/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from "uuid";
import { investMock, type Investment } from "./investment";

// Create a function to get coin data
const getCoinData = (symbol: string): Partial<Investment> => {
  const coinData: Record<string, Partial<Investment>> = {
    USDC: {
      name: "USD Coin",
      rate: 1.0,
      changePercent: -0.04,
    },
    BTC: {
      name: "Bitcoin",
      rate: 94567.89,
      changePercent: -0.04,
    },
    AAPL: {
      name: "Apple Inc.",
      rate: 224.37,
      changePercent: 0.12,
    },
  };

  return (
    coinData[symbol] || {
      name: symbol,
      rate: 1.0,
      changePercent: 0.0,
    }
  );
};

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
  buyCoins: (symbol: string, amount: number) => void;
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

      buyCoins: (symbol: string, amount: number) =>
        set((state) => {
          // Check if investment with this symbol already exists
          const existingInvestment = state.investments.find(
            (inv) => inv.symbol === symbol
          );

          if (existingInvestment) {
            // Add to existing investment
            existingInvestment.amount += amount;
          } else {
            // Create new investment
            const coinData = getCoinData(symbol);
            const newInvestment: Investment = {
              id: uuidv4(),
              symbol,
              currency: symbol,
              amount,
              name: coinData.name || symbol,
              rate: coinData.rate || 1.0,
              changePercent: coinData.changePercent || 0.0,
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
