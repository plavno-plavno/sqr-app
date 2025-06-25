export interface QuickAction {
  id: number;
  name: string;
  prompt: string;
  image?: string;
}

export const actionsMock: QuickAction[] = [
  {
    id: 1,
    name: "Abilities",
    prompt: "Show me your abilities",
  },
  {
    id: 2,
    name: "Quick Transfer",
    prompt: "I want to transfer money",
  },
  {
    id: 3,  
    name: "Show my analytics",
    prompt: "Show my spending analytics for whole year",
  },
  {
    id: 4,
    name: "Invest",
    prompt: "What is the best way to invest?",
  },
];
