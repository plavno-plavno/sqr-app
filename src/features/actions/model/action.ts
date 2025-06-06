export interface Action {
  id: number;
  name: string;
  image?: string;
}

export const actionsMock: Action[] = [
  {
    id: 1,
    name: "Quick Transfer",
  },
  {
    id: 2,
    name: "Show my expenses",
  },
  {
    id: 3,
    name: "Invest",
  },
];
