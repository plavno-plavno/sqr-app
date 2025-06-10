export interface Transaction {
  id: number;
  amount: number;
  username: string;
  date: Date;
  details: TransactionDetail[];
}

export interface TransactionDetail {
  name:
    | "Recipient"
    | "Bank Name"
    | "IBAN"
    | "Bank Account Number"
    | "Card"
    | (string & {});
  value: string;
}

export interface TransactionGroup {
  id: string;
  date: string;
  transactions: Transaction[];
}

function getRelativeDate(
  options: {
    days?: number;
    hours?: number;
    minutes?: number;
  } = {}
): Date {
  const { days = 0, hours = 0, minutes = 0 } = options;

  const millisecondsToSubtract =
    days * 24 * 60 * 60 * 1000 + // days to milliseconds
    hours * 60 * 60 * 1000 + // hours to milliseconds
    minutes * 60 * 1000; // minutes to milliseconds

  return new Date(Date.now() - millisecondsToSubtract);
}

export const lastTransactionsMock: Transaction[] = [
  {
    id: 7,
    amount: 7,
    username: "Anna",
    date: getRelativeDate({ days: 1, hours: 4, minutes: 25 }),
    details: [
      { name: "Recipient", value: "Coffee Shop +1234567890" },
      { name: "Bank Name", value: "Bank of America" },
      { name: "IBAN", value: "US64BOFA00000123456789" },
      { name: "Bank Account Number", value: "1234567890" },
      { name: "Card", value: "4111111111114532" },
    ],
  },
  {
    id: 4,
    amount: 1,
    username: "Michael",
    date: getRelativeDate({ hours: 3 }),
    details: [
      { name: "Recipient", value: "Gas Station +1234567891" },
      { name: "Bank Name", value: "Chase Bank" },
      { name: "IBAN", value: "US64CHAS00000123456789" },
      { name: "Bank Account Number", value: "2345678901" },
      { name: "Card", value: "5555555555551234" },
    ],
  },
  {
    id: 11,
    amount: 11,
    username: "Caleb",
    date: getRelativeDate({ days: 2, hours: 12, minutes: 15 }),
    details: [
      { name: "Recipient", value: "Restaurant +1234567892" },
      { name: "Bank Name", value: "Wells Fargo" },
      { name: "IBAN", value: "US64WELL00000123456789" },
      { name: "Bank Account Number", value: "3456789012" },
      { name: "Card", value: "4000000000005678" },
    ],
  },
  {
    id: 2,
    amount: 5,
    username: "John",
    date: getRelativeDate({ minutes: 45 }),
    details: [
      { name: "Recipient", value: "Grocery Store +1234567893" },
      { name: "Bank Name", value: "Citibank" },
      { name: "IBAN", value: "US64CITI00000123456789" },
      { name: "Bank Account Number", value: "4567890123" },
      { name: "Card", value: "5105105105109012" },
    ],
  },
  {
    id: 9,
    amount: 11,
    username: "Richard",
    date: getRelativeDate({ days: 1, hours: 12, minutes: 30 }),
    details: [
      { name: "Recipient", value: "Online Store +1234567894" },
      { name: "Bank Name", value: "TD Bank" },
      { name: "IBAN", value: "US64TDBA00000123456789" },
      { name: "Bank Account Number", value: "5678901234" },
      { name: "Card", value: "4242424242423456" },
    ],
  },
  {
    id: 1,
    amount: 2,
    username: "Anna",
    date: getRelativeDate({ minutes: 30 }),
    details: [
      { name: "Recipient", value: "Pharmacy +1234567895" },
      { name: "Bank Name", value: "PNC Bank" },
      { name: "IBAN", value: "US64PNCB00000123456789" },
      { name: "Bank Account Number", value: "6789012345" },
      { name: "Card", value: "4111111111117890" },
    ],
  },
  {
    id: 5,
    amount: 3,
    username: "Sophia",
    date: getRelativeDate({ hours: 4 }),
    details: [
      { name: "Recipient", value: "Bookstore +1234567896" },
      { name: "Bank Name", value: "US Bank" },
      { name: "IBAN", value: "US64USBA00000123456789" },
      { name: "Bank Account Number", value: "7890123456" },
      { name: "Card", value: "5555555555552345" },
    ],
  },
  {
    id: 10,
    amount: 11,
    username: "John",
    date: getRelativeDate({ days: 2, hours: 1 }),
    details: [
      { name: "Recipient", value: "Electronics Store +1234567897" },
      { name: "Bank Name", value: "Capital One" },
      { name: "IBAN", value: "US64CAPO00000123456789" },
      { name: "Bank Account Number", value: "8901234567" },
      { name: "Card", value: "4000000000006789" },
    ],
  },
  {
    id: 3,
    amount: 10,
    username: "Emily",
    date: getRelativeDate({ hours: 2 }),
    details: [
      { name: "Recipient", value: "Clothing Store +1234567898" },
      { name: "Bank Name", value: "Discover Bank" },
      { name: "IBAN", value: "US64DISC00000123456789" },
      { name: "Bank Account Number", value: "9012345678" },
      { name: "Card", value: "5105105105100123" },
    ],
  },
  {
    id: 8,
    amount: 2,
    username: "Sophia",
    date: getRelativeDate({ days: 1, hours: 6, minutes: 11 }),
    details: [
      { name: "Recipient", value: "Taxi Service +1234567899" },
      { name: "Bank Name", value: "American Express" },
      { name: "IBAN", value: "US64AMEX00000123456789" },
      { name: "Bank Account Number", value: "0123456789" },
      { name: "Card", value: "378282246314567" },
    ],
  },
  {
    id: 6,
    amount: 4,
    username: "John",
    date: getRelativeDate({ days: 1, hours: 1 }),
    details: [
      { name: "Recipient", value: "Movie Theater +1234567800" },
      { name: "Bank Name", value: "HSBC Bank" },
      { name: "IBAN", value: "US64HSBC00000123456789" },
      { name: "Bank Account Number", value: "1357924680" },
      { name: "Card", value: "4242424242428901" },
    ],
  },
];
