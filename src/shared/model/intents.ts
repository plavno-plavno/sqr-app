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
  abilities: Partial<{
    intent_name: string;
    description: string;
  }>[];
  summary: Partial<Summary>;
}

// BTC_PRICE Intent Response Schema
export interface BTCPriceOutput {
  current_price: number;
  currency: string;
  price_points: Partial<{
    timestamp: string;
    price: number;
  }>[];
  summary: Partial<Summary>;
}

// BUY_BTC Intent Response Schema
export interface BuyBTCOutput {
  purchase_details: Partial<{
    btc_amount: number;
    current_price: number;
    total_cost: number;
    currency: string;
    transaction_id: string;
    timestamp: string; // ISO format
  }>;
  market_info: Partial<{
    btc_price: number;
    price_change_24h: number;
    market_trend: "bullish" | "bearish" | "neutral";
  }>;
  warnings: Partial<Warning>[];
  summary: Partial<Summary>;
}

// DAILY_BUDGET Intent Response Schema
export interface DailyBudgetOutput {
  budget_summary: Partial<{
    daily_limit: number;
    total_expenses: number;
    available_balance: number;
    days_remaining: number;
  }>;
  expense_breakdown: Partial<{
    upcoming_expenses: Array<Partial<{
      description: string;
      amount: number;
      due_date: string; // YYYY-MM-DD
    }>>;
    total_upcoming: number;
  }>;
  suggestions: Array<Partial<{
    title: string;
    description: string;
    potential_savings: number;
  }>>;
  summary: Partial<{
    status: string;
    message: string;
    risk_level: "low" | "medium" | "high";
  }>;
}

// SCHEDULED_TRANSFER Intent Response Schema
export interface ScheduledTransferOutput {
  transfer_details: Partial<{
    amount: number;
    currency: string;
    recipient: string;
    scheduled_time: string; // ISO format
    confirmation_number: string;
  }>;
  notifications: Partial<{
    email_sent: boolean;
    sms_sent: boolean;
    recipient_notified: boolean;
  }>;
  warnings: Partial<Warning>[];
  summary: Partial<Summary>;
}

// SPENDING_INSIGHTS Intent Response Schema
export interface SpendingInsightsOutput {
  top_categories: Array<Partial<{
    category: string;
    amount: number;
    percentage: number;
    trend: "up" | "down" | "stable";
  }>>;
  unexpected_expenses: Array<Partial<{
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
    category: string;
  }>>;
  subscription_analysis: Partial<{
    total_monthly: number;
    subscriptions: Array<Partial<{
      name: string;
      amount: number;
      frequency: string;
      category: string;
    }>>;
  }>;
  suggestions: Array<Partial<{
    title: string;
    description: string;
    impact: string;
    action_url?: string; // optional
  }>>;
  summary: Partial<{
    total_spent: number;
    month: string;
    year: number;
    insights: string[];
  }>;
}

// SPENDING_ANALYTICS Intent Response Schema
export interface SpendingAnalyticsOutput {
  spending_analysis: Partial<{
    total_spent: number;
    categories: Array<Partial<{
      name: string;
      amount: number;
      percentage: number;
      trend: "up" | "down" | "stable";
    }>>;
    month: string;
    year: number;
  }>;
  comparison: Partial<{
    previous_month: Partial<{
      total_spent: number;
      percentage_change: number;
    }>;
  }>;
  insights: Array<Partial<{
    type: string;
    message: string;
    impact: string;
    suggestion: string;
  }>>;
  summary: Partial<{
    status: string;
    key_findings: string[];
    recommendations: string[];
  }>;
}

// TRANSFER_MONEY Intent Response Schema
export interface TransferMoneyOutput {
  transfer_details: Partial<{
    amount: number;
    currency: string;
    recipient: string;
    transaction_id: string;
    timestamp: string; // ISO format
  }>;
  notifications: Partial<{
    recipient_phone: string;
    email_sent: boolean;
    sms_sent: boolean;
    recipient_notified: boolean;
  }>;
  warnings: Partial<Warning>[];
  summary: Partial<Summary>;
}

// GOODBYE Intent Response Schema
export interface GoodbyeOutput {
  conversation_status?: string;
}

// INVESTMENT Intent Response Schema
export interface InvestmentOutput {
  investment_details: Partial<{
    stock_symbol: string;
    investment_amount: number;
    current_price: number;
    shares_to_purchase: number;
    currency: string;
    transaction_id: string;
    timestamp: string; // ISO format
  }>;
  market_info: Partial<{
    current_price: number;
    price_change_24h: number;
    price_change_percent: number;
    market_trend: "bullish" | "bearish" | "neutral";
    volume: number;
    market_cap: number;
  }>;
  warnings: Partial<Warning>[];
  summary: Partial<Summary>;
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
  output: Partial<AbilitiesOutput>;
};

export type BTCPriceResponse = AgentResponseBase & {
  intent: IntentType.BTC_PRICE;
  output: Partial<BTCPriceOutput>;
};

export type BuyBTCResponse = AgentResponseBase & {
  intent: IntentType.BUY_BTC;
  output: Partial<BuyBTCOutput>;
};

export type DailyBudgetResponse = AgentResponseBase & {
  intent: IntentType.DAILY_BUDGET;
  output: Partial<DailyBudgetOutput>;
};

export type ScheduledTransferResponse = AgentResponseBase & {
  intent: IntentType.SCHEDULED_TRANSFER;
  output: Partial<ScheduledTransferOutput>;
};

export type SpendingInsightsResponse = AgentResponseBase & {
  intent: IntentType.SPENDING_INSIGHTS;
  output: Partial<SpendingInsightsOutput>;
};

export type SpendingAnalyticsResponse = AgentResponseBase & {
  intent: IntentType.SPENDING_ANALYTICS;
  output: Partial<SpendingAnalyticsOutput>;
};

export type TransferMoneyResponse = AgentResponseBase & {
  intent: IntentType.TRANSFER_MONEY;
  output: Partial<TransferMoneyOutput>;
};

export type GoodbyeResponse = AgentResponseBase & {
  intent: IntentType.GOODBYE;
  output: Partial<GoodbyeOutput>;
};

export type InvestmentResponse = AgentResponseBase & {
  intent: IntentType.INVESTMENT;
  output: Partial<InvestmentOutput>;
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
