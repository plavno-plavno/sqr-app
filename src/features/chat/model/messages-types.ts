// Text
export interface Text {
  text: string;
}

// Success
export interface Success {
  text: string;
}

// LineChart
type RowData = Record<string, string | number>;

interface LineChartData {
  day: RowData[]; // например, [{ day: "2021-01-01", price: 100 }]
  week: RowData[];
  month: RowData[];
  year: RowData[];
  all: RowData[];
}

export interface LineChart {
  chartData: LineChartData;
  valueKey: string; // название ключа для значения, например, "price"
}

// PieChart
type PieChartData = Record<string, string | number | boolean> & {
  showIcon?: boolean; // если смотреть по фигме, это значок стрелки, когда цена выросла
}; // например, { category: "transport", amount: 200.32, showIcon: true }

interface PieChartConfig {
  [key: string]: {
    // тут ключ - название категории, по примеру - "transport"
    label: string; // лейбл категории, по примеру - "Transport"
  };
}

export interface PieChart {
  title: string; // если смотреть по фигме, это "Expenses for"
  titleBoldPart: string; // если смотреть по фигме, это "April"
  amount: string; // если смотреть по фигме, это "1403.50"
  chartData: PieChartData[];
  chartConfig: PieChartConfig;
  dataKey: string; // название ключа для значения, по примеру - "amount"
  nameKey: string; // название ключа для названия, по примеру - "category"
  valueSign?: string; // знак валюты, например, "$"
}

// ContactList
interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface ContactList {
  contacts: Contact[];
}

// MoneyInfo
export interface MoneyInfo {
  title: string;
  amount: string;
}

// MoneyTransfer
export interface MoneyTransfer {
  amount: string;
  recipient: string;
  phone: string;
  date: Date;
}

// Subscription
export interface Subscription {
  title: string;
  amount: string;
  period: string; // например, "month"
}
