import {
  ChatMessageRole,
  ChatMessageType,
  type ChatMessage,
} from "@/features/chat";
import { IntentType } from "@/shared/model/intents";
import { v4 as uuidv4 } from "uuid";

export interface ActionType {
  id: string;
  name: string;
  title: string;
  messages?: ChatMessage[];
  prompt?: string;
  image?: string;
}

const userMessage = (text: string): ChatMessage => ({
  id: uuidv4(),
  text,
  role: ChatMessageRole.USER_TEXT,
  type: ChatMessageType.TEXT,
  isTextCorrected: true,
});

export const AllActionsMock: ActionType[] = [
  {
    id: uuidv4(),
    name: "Show Abilities",
    title: "Abilities",
    messages: [
      userMessage("Show me all your abilities"),
      {
        id: uuidv4(),
        role: ChatMessageRole.AGENT,
        type: IntentType.ABILITIES,
      },
    ],
  },
  {
    id: uuidv4(),
    name: "Quick Transfer",
    title: "Quick Transfer",
    messages: [
      userMessage("I want to transfer money"),
      {
        id: uuidv4(),
        role: ChatMessageRole.AGENT,
        type: ChatMessageType.CONTACTS,
      },
    ],
  },
  {
    id: uuidv4(),
    name: "Show my expenses",
    title: "Expenses",
    prompt: "Show my spending analytics for whole year",
    messages: [
      userMessage("Show my spending analytics for whole year"),
    ],
  },
  {
    id: uuidv4(),
    name: "Invest",
    title: "Invest",
    messages: [
      {
        id: uuidv4(),
        text: "What would you like to invest into?",
        role: ChatMessageRole.AGENT,
        type: ChatMessageType.TEXT,
      },
    ],
  },
  {
    id: uuidv4(),
    name: "Expense analysis",
    title: "Expense analysis",
    prompt: "Where my money is going?",
    messages: [
      userMessage("Where my money is going?"),
    ],
  },
  {
    id: uuidv4(),
    name: "Daily budget",
    title: "Daily budget",
    prompt: "Setup my daily budget",
    messages: [
      userMessage("Setup my daily budget"),
    ],
  },
  {
    id: uuidv4(),
    name: "Cost estimation",
    title: "Cost estimation",
    prompt: "Help me to estimate the cost",
    messages: [
      userMessage("Help me to estimate the cost"),
    ],
  },
];

export const quickActionsMock = AllActionsMock.filter((action) =>
  ["Show Abilities", "Quick Transfer", "Show my expenses", "Invest"].includes(
    action.name
  )
);

export const abilitiesMock = AllActionsMock.filter(
  (action) => !["Show Abilities"].includes(action.name)
);
