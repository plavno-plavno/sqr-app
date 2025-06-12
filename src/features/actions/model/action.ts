export interface QuickAction {
  id: number;
  name: string;
  prompt: string;
  image?: string;
}

export const actionsMock: QuickAction[] = [
  {
    id: 1,
    name: "Quick Transfer",
    prompt: "Who do you want to make the transfer to?",
  },
  {
    id: 2,  
    name: "Show my expenses",
    prompt: "What do you want to see?",
  },
  {
    id: 3,
    name: "Invest",
    prompt: "What do you want to invest in?",
  },
];
