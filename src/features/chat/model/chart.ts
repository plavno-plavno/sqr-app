// Test data for different time periods
type RowData = Record<string, string | number>;

export interface LineChartData {
  day: RowData[];
  week: RowData[];
  month: RowData[];
  year: RowData[];
  all: RowData[];
}

export type PieChartData = Record<string, string | number | boolean> & {
  showIcon?: boolean;
};

export interface PieChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const chartDayData = [
  { time: "00:00", price: 45 },
  { time: "03:00", price: 38 },
  { time: "06:00", price: 52 },
  { time: "09:00", price: 78 },
  { time: "12:00", price: 95 },
  { time: "15:00", price: 88 },
  { time: "18:00", price: 102 },
  { time: "21:00", price: 67 },
];

const chartWeekData = [
  { day: "Mon", price: 186 },
  { day: "Tue", price: 305 },
  { day: "Wed", price: 237 },
  { day: "Thu", price: 273 },
  { day: "Fri", price: 209 },
  { day: "Sat", price: 214 },
  { day: "Sun", price: 156 },
];

const chartMonthData = [
  { date: "1", price: 186 },
  { date: "3", price: 237 },
  { date: "5", price: 209 },
  { date: "7", price: 156 },
  { date: "9", price: 321 },
  { date: "11", price: 267 },
  { date: "13", price: 312 },
  { date: "15", price: 289 },
  { date: "17", price: 278 },
  { date: "19", price: 312 },
  { date: "21", price: 267 },
  { date: "23", price: 234 },
  { date: "25", price: 189 },
  { date: "27", price: 298 },
  { date: "29", price: 312 },
];

const chartYearData = [
  { month: "Jan", price: 2186 },
  { month: "Feb", price: 3005 },
  { month: "Mar", price: 2637 },
  { month: "Apr", price: 2073 },
  { month: "May", price: 2809 },
  { month: "Jun", price: 2614 },
  { month: "Jul", price: 2856 },
  { month: "Aug", price: 3298 },
  { month: "Sep", price: 2789 },
  { month: "Oct", price: 2967 },
  { month: "Nov", price: 2734 },
  { month: "Dec", price: 3112 },
];

const chartAllData = [
  { year: "2020", price: 28567 },
  { year: "2021", price: 32145 },
  { year: "2022", price: 35234 },
  { year: "2023", price: 38912 },
  { year: "2024", price: 42156 },
];

export const pieChartDataMock: PieChartData[] = [
  { category: "food", amount: 275.53, showIcon: false },
  { category: "transport", amount: 200.32, showIcon: true },
  { category: "entertainment", amount: 187.32, showIcon: false },
  { category: "shopping", amount: 173.42, showIcon: false },
  { category: "other", amount: 90.99, showIcon: false },
];

export const lineChartDataMock: LineChartData = {
  day: chartDayData,
  week: chartWeekData,
  month: chartMonthData,
  year: chartYearData,
  all: chartAllData,
};
