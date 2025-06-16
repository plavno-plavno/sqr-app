export enum IntentType {
  BUY_BTC = "buy_btc",
  DAILY_BUDGET = "daily_budget",
  SCHEDULED_TRANSFER = "scheduled_transfer",
  SPENDING_INSIGHTS = "spending_insights",
  SPENDING_ANALYTICS = "spending_analytics",
  TRANSFER_MONEY = "transfer_money",
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
  next_steps: string[];
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
    amount: number;
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
      amount: number;
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
      amount: number;
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
    amount: number;
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

export type BuyBTCResponse = {
  intent: IntentType.BUY_BTC;
  output: BuyBTCOutput;
  text?: string;
};

export type DailyBudgetResponse = {
  intent: IntentType.DAILY_BUDGET;
  output: DailyBudgetOutput;
  text?: string;
};

export type ScheduledTransferResponse = {
  intent: IntentType.SCHEDULED_TRANSFER;
  output: ScheduledTransferOutput;
  text?: string;
};

export type SpendingInsightsResponse = {
  intent: IntentType.SPENDING_INSIGHTS;
  output: SpendingInsightsOutput;
  text?: string;
};

export type SpendingAnalyticsResponse = {
  intent: IntentType.SPENDING_ANALYTICS;
  output: SpendingAnalyticsOutput;
  text?: string;
};

export type TransferMoneyResponse = {
  intent: IntentType.TRANSFER_MONEY;
  output: TransferMoneyOutput;
  text?: string;
};

export type IntentResponse =
  | BuyBTCResponse
  | DailyBudgetResponse
  | ScheduledTransferResponse
  | SpendingInsightsResponse
  | SpendingAnalyticsResponse
  | TransferMoneyResponse;
