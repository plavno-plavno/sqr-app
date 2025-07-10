export interface Transaction {
  id: number;
  amount: number;
  date: string;
  details: TransactionDetail[];
}

export interface TransactionDetail {
  name:
    | "Recipient"
    | "Phone Number"
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
): string {
  const { days = 0, hours = 0, minutes = 0 } = options;

  const millisecondsToSubtract =
    days * 24 * 60 * 60 * 1000 + // days to milliseconds
    hours * 60 * 60 * 1000 + // hours to milliseconds
    minutes * 60 * 1000; // minutes to milliseconds

  return new Date(Date.now() - millisecondsToSubtract).toISOString();
}

export function getRandomDetails(): TransactionDetail[] {
  const randomIndex = Math.floor(Math.random() * transactionDetails.length);
  return transactionDetails[randomIndex];
}

const recipientDetails = [
  [
    { name: "Recipient", value: "Anna" },
    { name: "Card", value: "4532015112830366" },
  ],
  [
    { name: "Recipient", value: "Michael" },
    { name: "Card", value: "5425233430109903" },
  ],
  [
    { name: "Recipient", value: "Emma" },
    { name: "Card", value: "4716059552607562" },
  ],
  [
    { name: "Recipient", value: "David" },
    { name: "Card", value: "5555341244441115" },
  ],
  [
    { name: "Recipient", value: "Sophie" },
    { name: "Card", value: "4000056655665556" },
  ],
  [
    { name: "Recipient", value: "Carlos" },
    { name: "Card", value: "5105105105105100" },
  ],
  [
    { name: "Recipient", value: "Olivia" },
    { name: "Card", value: "4111111111111111" },
  ],
  [
    { name: "Recipient", value: "Ahmed" },
    { name: "Card", value: "5200828282828210" },
  ],
  [
    { name: "Recipient", value: "Isabella" },
    { name: "Card", value: "4242424242424242" },
  ],
  [
    { name: "Recipient", value: "Alex" },
    { name: "Card", value: "378282246310005" },
  ],
  [
    { name: "Recipient", value: "Lisa" },
    { name: "Card", value: "4000000000000002" },
  ],
];

const transactionDetails = [
  [
    { name: "Phone Number", value: "+1 (555) 123-4567" },
    { name: "Bank Name", value: "JPMorgan Chase" },
    { name: "IBAN", value: "US33JPMC0000000123456789" },
    { name: "Bank Account Number", value: "4729358160" },
  ],
  [
    { name: "Phone Number", value: "+44 20 7946 0958" },
    { name: "Bank Name", value: "Barclays Bank" },
    { name: "IBAN", value: "GB29BARC20051234567890" },
    { name: "Bank Account Number", value: "8374926051" },
  ],
  [
    { name: "Phone Number", value: "+1 (416) 789-2345" },
    { name: "Bank Name", value: "Royal Bank of Canada" },
    { name: "IBAN", value: "CA89RBCD12345678901234" },
    { name: "Bank Account Number", value: "5672839470" },
  ],
  [
    { name: "Phone Number", value: "+81 3-5555-1234" },
    { name: "Bank Name", value: "Mizuho Bank" },
    { name: "IBAN", value: "JP62MHBK1234567890123456" },
    { name: "Bank Account Number", value: "9184726350" },
  ],
  [
    { name: "Phone Number", value: "+49 30 12345678" },
    { name: "Bank Name", value: "Deutsche Bank" },
    { name: "IBAN", value: "DE89370400440532013000" },
    { name: "Bank Account Number", value: "2947583610" },
  ],
  [
    { name: "Phone Number", value: "+33 1 42 86 83 26" },
    { name: "Bank Name", value: "BNP Paribas" },
    { name: "IBAN", value: "FR1420041010050500013M02606" },
    { name: "Bank Account Number", value: "6358294170" },
  ],
  [
    { name: "Phone Number", value: "+61 2 9876 5432" },
    { name: "Bank Name", value: "Commonwealth Bank" },
    { name: "IBAN", value: "AU31CBA0123456789012345" },
    { name: "Bank Account Number", value: "7495831620" },
  ],
  [
    { name: "Phone Number", value: "+971 4 123 4567" },
    { name: "Bank Name", value: "Emirates NBD" },
    { name: "IBAN", value: "AE070331234567890123456" },
    { name: "Bank Account Number", value: "8372649150" },
  ],
  [
    { name: "Phone Number", value: "+34 91 123 45 67" },
    { name: "Bank Name", value: "Banco Santander" },
    { name: "IBAN", value: "ES9121000418450200051332" },
    { name: "Bank Account Number", value: "3926574810" },
  ],
  [
    { name: "Phone Number", value: "+7 495 123-45-67" },
    { name: "Bank Name", value: "Sberbank" },
    { name: "IBAN", value: "RU0204452560000000000000" },
    { name: "Bank Account Number", value: "5847293610" },
  ],
  [
    { name: "Phone Number", value: "+91 22 1234 5678" },
    { name: "Bank Name", value: "State Bank of India" },
    { name: "IBAN", value: "IN60SBIN0000123456789012" },
    { name: "Bank Account Number", value: "6947258301" },
  ],
];

function getCombinedDetails(index: number): TransactionDetail[] {
  return [
    ...recipientDetails[index].slice(0, 1),
    ...transactionDetails[index],
    ...recipientDetails[index].slice(1),
  ];
}

export const lastTransactionsMock: Transaction[] = [
  {
    id: 7,
    amount: 7,
    date: getRelativeDate({ days: 1, hours: 4, minutes: 25 }),
    details: getCombinedDetails(0),
  },
  {
    id: 4,
    amount: 1,
    date: getRelativeDate({ hours: 3 }),
    details: getCombinedDetails(1),
  },
  {
    id: 11,
    amount: 11,
    date: getRelativeDate({ days: 2, hours: 12, minutes: 15 }),
    details: getCombinedDetails(2),
  },
  {
    id: 2,
    amount: 5,
    date: getRelativeDate({ minutes: 45 }),
    details: getCombinedDetails(3),
  },
  {
    id: 9,
    amount: 11,
    date: getRelativeDate({ days: 1, hours: 12, minutes: 30 }),
    details: getCombinedDetails(4),
  },
  {
    id: 1,
    amount: 2,
    date: getRelativeDate({ minutes: 30 }),
    details: getCombinedDetails(5),
  },
  {
    id: 5,
    amount: 3,
    date: getRelativeDate({ hours: 4 }),
    details: getCombinedDetails(6),
  },
  {
    id: 10,
    amount: 11,
    date: getRelativeDate({ days: 2, hours: 1 }),
    details: getCombinedDetails(7),
  },
  {
    id: 3,
    amount: 10,
    date: getRelativeDate({ hours: 2 }),
    details: getCombinedDetails(8),
  },
  {
    id: 8,
    amount: 2,
    date: getRelativeDate({ days: 1, hours: 6, minutes: 11 }),
    details: getCombinedDetails(9),
  },
  {
    id: 6,
    amount: 4,
    date: getRelativeDate({ days: 1, hours: 1 }),
    details: getCombinedDetails(10),
  },
];
