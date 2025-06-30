import { v4 as uuidv4 } from 'uuid';
import UsdIcon from '@/shared/assets/icons/usd-icon.svg?react';
import BtcIcon from '@/shared/assets/icons/bitcoin-icon.svg?react';

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  price: number;
  amount: number;
  changePercent: number;
  icon: React.ReactNode;
  currency: string;
}

export interface InvestSummary {
  amount: number;
  change: number;
}

// Mock data for investments
export const investMock: Investment[] = [
  {
    id: uuidv4(),
    symbol: 'USDC',
    name: 'USD Coin',
    price: 9.45,
    amount: 9.4,
    changePercent: -0.04,
    currency: 'USDC',
    icon: <UsdIcon />,
  },
  {
    id: uuidv4(),
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 50467.67,
    amount: 0.4,
    changePercent: -0.04,
    currency: 'BTC',
    icon: <BtcIcon />,
  },
];

export const investSummaryMock: InvestSummary = {
  amount: 50,
  change: 0.45,
}; 