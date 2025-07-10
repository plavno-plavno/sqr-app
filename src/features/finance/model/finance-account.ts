import { v4 as uuidv4 } from "uuid";

export enum PaymentMethod {
  CreditCard = "Card",
  Crypto = "Crypto",
}

export interface PaymentOption {
  identifier: string;
  paymentMethod: PaymentMethod;
}

export interface FinanceAccount {
  id: string;
  name: string;
  balance: number;
  identifier: string;
  currency: string;
  type: PaymentMethod;
}

// Mock data for finance accounts
export const financeAccountsMock: FinanceAccount[] = [
  {
    id: uuidv4(),
    name: "Bank account 1",
    balance: 5040,
    identifier: "1234 5678 9012 3456",
    currency: "USD",
    type: PaymentMethod.CreditCard,
  },
  {
    id: uuidv4(),
    name: "Bank account 2",
    balance: 10,
    identifier: "5899 6351 9012 9752",
    currency: "USD",
    type: PaymentMethod.CreditCard,
  },
  {
    id: uuidv4(),
    name: "Bank account 3",
    balance: 10.45,
    identifier: "2341 5678 4362 4652",
    currency: "USD",
    type: PaymentMethod.CreditCard,
  },
  {
    id: uuidv4(),
    name: "Crypto account",
    balance: 2.5,
    identifier: "17rm2dvb439dZqyMe2d4D6AQJSgg6yeNRn",
    currency: "BTC",
    type: PaymentMethod.Crypto,
  },
];

export const paymentOptionsMock: PaymentOption[] = financeAccountsMock.map(
  (account) => ({
    identifier: account.identifier,
    paymentMethod: account.type,
  })
);
