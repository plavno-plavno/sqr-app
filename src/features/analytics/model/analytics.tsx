import { v4 as uuid } from "uuid";
import AllAccountsIcon from "@/shared/assets/icons/all-accounts-icon.svg?react";
import DateIcon from "@/shared/assets/icons/date-icon.svg?react";

export interface FilterType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface ChartDataPoint {
  day: string;
  amount: number;
}

export interface MonthlyBudget {
  title: string;
  dailyLimit: string;
  remaining: string;
  total: string;
  progress: number; // percentage from 0 to 100
}

export interface SpendingCategory {
  id: string;
  title: string;
  transactions: string;
  amount: string;
  percentage: string;
}

// Mock data
export const filtersMock: FilterType[] = [
  {
    id: uuid(),
    label: "All accounts",
    icon: <AllAccountsIcon />
  },
  {
    id: uuid(),
    label: "April",
    icon: <DateIcon />
  },
];

export const chartDataMock: ChartDataPoint[] = [
  { day: "1", amount: 20 },
  { day: "5", amount: 35 },
  { day: "10", amount: 30 },
  { day: "15", amount: 45 },
  { day: "20", amount: 40 },
  { day: "25", amount: 50 },
  { day: "31", amount: 30 },
];

export const monthlyBudgetMock: MonthlyBudget = {
  title: "Monthly budget",
  dailyLimit: "$100 / day",
  remaining: "$2356 left",
  total: "of $40000",
  progress: 65, // 65% used
};

export const spendingCategoriesMock: SpendingCategory[] = [
  {
    id: uuid(),
    title: "Shopping",
    transactions: "18 transactions",
    amount: "$235",
    percentage: "21%",
  },
  {
    id: uuid(),
    title: "Groceries", 
    transactions: "5 transactions",
    amount: "$35",
    percentage: "11%",
  },
  {
    id: uuid(),
    title: "Restaurants",
    transactions: "12 transactions", 
    amount: "$1500",
    percentage: "50%",
  },
  {
    id: uuid(),
    title: "Electronics",
    transactions: "8 transactions",
    amount: "$450", 
    percentage: "8%",
  },
]; 