export interface ChatHistory {
  id: number;
  text: string;
}

export const chatsMock: ChatHistory[] = [
  {
    id: 1,
    text: "Buying $100 worth of bitcoin",
  },
  {
    id: 2,
    text: "Send $200 to Anna",
  },
  {
    id: 3,
    text: "April expenses",
  },
  {
    id: 4,
    text: "Budget estimation",
  },
];
