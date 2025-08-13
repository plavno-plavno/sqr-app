export enum IntentType {
  ABILITIES = "abilities",
  BTC_PRICE = "btc_price",
  BUY_BTC = "buy_btc",
  DAILY_BUDGET = "daily_budget",
  SCHEDULED_TRANSFER = "scheduled_transfer",
  SPENDING_INSIGHTS = "spending_insights",
  SPENDING_ANALYTICS = "spending_analytics",
  TRANSFER_MONEY = "transfer_money",
  GOODBYE = "goodbye",
  INVESTMENT = "investment",
  NONE = "none",
}

// Base interfaces for common structures
interface Warning {
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
}

interface Summary {
  status: string;
  message: string;
  next_steps?: string[];
}

// ABILITIES Intent Response Schema
export interface AbilitiesOutput {
  abilities: {
    intent_name: string;
    description: string;
  }[];
  summary: Summary;
}

// BTC_PRICE Intent Response Schema
export interface BTCPriceOutput {
  current_price: number;
  currency: string;
  price_points: {
    timestamp: string;
    price: number;
  }[];
  summary: Summary;
}

// BUY_BTC Intent Response Schema
export interface BuyBTCOutput {
  purchase_details: {
    btc_amount: number;
    current_price: number;
    total_cost: number;
    currency: string;
    transaction_id: string;
    timestamp: string; // ISO format
  };
  market_info: {
    btc_price: number;
    price_change_24h: number;
    market_trend: "bullish" | "bearish" | "neutral";
  };
  warnings: Warning[];
  summary: Summary;
}

// DAILY_BUDGET Intent Response Schema
export interface DailyBudgetOutput {
  budget_summary: {
    daily_limit: number;
    total_expenses: number;
    available_balance: number;
    days_remaining: number;
  };
  expense_breakdown: {
    upcoming_expenses: Array<{
      description: string;
      amount: number;
      due_date: string; // YYYY-MM-DD
    }>;
    total_upcoming: number;
  };
  suggestions: Array<{
    title: string;
    description: string;
    potential_savings: number;
  }>;
  summary: {
    status: string;
    message: string;
    risk_level: "low" | "medium" | "high";
  };
}

// SCHEDULED_TRANSFER Intent Response Schema
export interface ScheduledTransferOutput {
  transfer_details: {
    amount: number | string;
    currency: string;
    recipient: string;
    scheduled_time: string; // ISO format
    confirmation_number: string;
  };
  notifications: {
    email_sent: boolean;
    sms_sent: boolean;
    recipient_notified: boolean;
  };
  warnings: Warning[];
  summary: Summary;
}

// SPENDING_INSIGHTS Intent Response Schema
export interface SpendingInsightsOutput {
  top_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: "up" | "down" | "stable";
  }>;
  unexpected_expenses: Array<{
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
    category: string;
  }>;
  subscription_analysis: {
    total_monthly: number;
    subscriptions: Array<{
      name: string;
      amount: number | string;
      frequency: string;
      category: string;
    }>;
  };
  suggestions: Array<{
    title: string;
    description: string;
    impact: string;
    action_url?: string; // optional
  }>;
  summary: {
    total_spent: number;
    month: string;
    year: number;
    insights: string[];
  };
}

// SPENDING_ANALYTICS Intent Response Schema
export interface SpendingAnalyticsOutput {
  spending_analysis: {
    total_spent: number;
    categories: Array<{
      name: string;
      amount: number | string;
      percentage: number;
      trend: "up" | "down" | "stable";
    }>;
    month: string;
    year: number;
  };
  comparison: {
    previous_month: {
      total_spent: number;
      percentage_change: number;
      categories: Array<{
        name: string;
        amount: number;
        percentage_change: number;
      }>;
    };
  };
  insights: Array<{
    type: string;
    message: string;
    impact: string;
    suggestion: string;
  }>;
  summary: {
    status: string;
    key_findings: string[];
    recommendations: string[];
  };
}

// TRANSFER_MONEY Intent Response Schema
export interface TransferMoneyOutput {
  transfer_details: {
    amount: number | string;
    currency: string;
    recipient: string;
    transaction_id: string;
    timestamp: string; // ISO format
  };
  notifications: {
    email_sent: boolean;
    sms_sent: boolean;
    recipient_notified: boolean;
  };
  warnings: Warning[];
  summary: Summary;
}

// GOODBYE Intent Response Schema
export interface GoodbyeOutput {
  conversation_status: string;
}

// INVESTMENT Intent Response Schema
export interface InvestmentOutput {
  investment_details: {
    stock_symbol: string;
    investment_amount: number;
    current_price: number;
    shares_to_purchase: number;
    currency: string;
    transaction_id: string;
    timestamp: string; // ISO format
  };
  market_info: {
    current_price: number;
    price_change_24h: number;
    price_change_percent: number;
    market_trend: "bullish" | "bearish" | "neutral";
    volume: number;
    market_cap: number;
  };
  warnings: Warning[];
  summary: Summary;
}

export type AgentResponseBase = {
  data: object;
  text: string;
  voice_tone: string;
  requires_followup: boolean;
  missing_fields: string[];
  error?: boolean;
};

export type AbilitiesResponse = AgentResponseBase & {
  intent: IntentType.ABILITIES;
  output: AbilitiesOutput;
};

export type BTCPriceResponse = AgentResponseBase & {
  intent: IntentType.BTC_PRICE;
  output: BTCPriceOutput;
};

export type BuyBTCResponse = AgentResponseBase & {
  intent: IntentType.BUY_BTC;
  output: BuyBTCOutput;
};

export type DailyBudgetResponse = AgentResponseBase & {
  intent: IntentType.DAILY_BUDGET;
  output: DailyBudgetOutput;
};

export type ScheduledTransferResponse = AgentResponseBase & {
  intent: IntentType.SCHEDULED_TRANSFER;
  output: ScheduledTransferOutput;
};

export type SpendingInsightsResponse = AgentResponseBase & {
  intent: IntentType.SPENDING_INSIGHTS;
  output: SpendingInsightsOutput;
};

export type SpendingAnalyticsResponse = AgentResponseBase & {
  intent: IntentType.SPENDING_ANALYTICS;
  output: SpendingAnalyticsOutput;
};

export type TransferMoneyResponse = AgentResponseBase & {
  intent: IntentType.TRANSFER_MONEY;
  output: TransferMoneyOutput;
};

export type GoodbyeResponse = AgentResponseBase & {
  intent: IntentType.GOODBYE;
  output: GoodbyeOutput;
};

export type InvestmentResponse = AgentResponseBase & {
  intent: IntentType.INVESTMENT;
  output: InvestmentOutput;
};

export type InvestmentResponseNone = AgentResponseBase & {
  intent: IntentType.NONE;
  output: object;
};

export type IntentResponse =
  | AbilitiesResponse
  | BTCPriceResponse
  | BuyBTCResponse
  | DailyBudgetResponse
  | ScheduledTransferResponse
  | SpendingInsightsResponse
  | SpendingAnalyticsResponse
  | TransferMoneyResponse
  | GoodbyeResponse
  | InvestmentResponse
  | InvestmentResponseNone;

export type OperationInfo = {
  intent: IntentType;
  info: Record<string, string | number | boolean | object>;
};
