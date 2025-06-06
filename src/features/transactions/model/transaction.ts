export interface Transaction {
  id: number;
  amount: number;
  username: string;
  date: Date;
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

export const lastTransactionsMock = [
  {
    id: 7,
    amount: 7,
    username: "Anna",
    date: getRelativeDate({ days: 1, hours: 4, minutes: 25 }),
  },
  {
    id: 4,
    amount: 1,
    username: "Michael",
    date: getRelativeDate({ hours: 3 }),
  },
  {
    id: 11,
    amount: 11,
    username: "Caleb",
    date: getRelativeDate({ days: 2, hours: 12, minutes: 15 }),
  },
  {
    id: 2,
    amount: 5,
    username: "John",
    date: getRelativeDate({ minutes: 45 }),
  },
  {
    id: 9,
    amount: 11,
    username: "Richard",
    date: getRelativeDate({ days: 1, hours: 12, minutes: 30 }),
  },
  {
    id: 1,
    amount: 2,
    username: "Anna",
    date: getRelativeDate({ minutes: 30 }),
  },
  {
    id: 5,
    amount: 3,
    username: "Sophia",
    date: getRelativeDate({ hours: 4 }),
  },
  {
    id: 10,
    amount: 11,
    username: "John",
    date: getRelativeDate({ days: 2, hours: 1 }),
  },
  {
    id: 3,
    amount: 10,
    username: "Emily",
    date: getRelativeDate({ hours: 2 }),
  },
  {
    id: 8,
    amount: 2,
    username: "Sophia",
    date: getRelativeDate({ days: 1, hours: 6, minutes: 11 }),
  },
  {
    id: 6,
    amount: 4,
    username: "John",
    date: getRelativeDate({ days: 1, hours: 1 }),
  },
];
