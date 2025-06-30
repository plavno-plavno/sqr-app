import { v4 as uuidv4 } from "uuid";

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  cardNumber: string; // Last 4 digits
  currency: string;
  type: 'checking' | 'savings' | 'credit';
}

// Mock data for bank accounts
export const bankAccountsMock: BankAccount[] = [
  {
    id: uuidv4(),
    name: 'Bank account 1',
    balance: 5040,
    cardNumber: '6567',
    currency: 'USD',
    type: 'checking',
  },
  {
    id: uuidv4(),
    name: 'Bank account 2',
    balance: 10,
    cardNumber: '4358',
    currency: 'USD',
    type: 'savings',
  },
  {
    id: uuidv4(),
    name: 'Bank account 3', 
    balance: 10.45,
    cardNumber: '2341',
    currency: 'USD',
    type: 'credit',
  },
]; 