import { v4 as uuidv4 } from "uuid";
import UsdIcon from "@/shared/assets/icons/usd-icon.svg?react";
import BtcIcon from "@/shared/assets/icons/bitcoin-icon.svg?react";

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  changePercent: number;
  currency: string;
  rate: number; // Exchange rate for price calculation
}

export const getInvestmentIcon = (symbol: string) => {
  switch (symbol) {
    case "USDC":
      return <UsdIcon />;
    case "BTC":
      return <BtcIcon />;
  }
};

// Mock data for investments
export const investMock: Investment[] = [
  {
    id: uuidv4(),
    symbol: "USDC",
    name: "USD Coin",
    amount: 9.4,
    changePercent: -0.04,
    currency: "USDC",
    rate: 1.0, // USD to USDC exchange rate
  },
  {
    id: uuidv4(),
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.05,
    changePercent: -0.04,
    currency: "BTC",
    rate: 94567.89, // USD to BTC exchange rate
  },
];
