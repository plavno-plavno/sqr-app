"use client";

import { Line, LineChart, YAxis } from "recharts";

import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import { ChevronUpIcon } from "@/shared/ui/icons/ChevronUpIcon";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/kit/chart";
import { useState } from "react";

// Test data for different time periods
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

const xAxisData = [
  { type: "day", label: "1D" },
  { type: "week", label: "1W" },
  { type: "month", label: "1M" },
  { type: "year", label: "1Y" },
  { type: "all", label: "All" },
];
const mapTypeToData = {
  day: chartDayData,
  week: chartWeekData,
  month: chartMonthData,
  year: chartYearData,
  all: chartAllData,
};

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ChartType = "day" | "week" | "month" | "year" | "all";

interface ChatChartMessageProps {
  className?: string;
}

export function ChatChartMessage({ className }: ChatChartMessageProps) {
  const [chartType, setChartType] = useState<ChartType>("month");
  const chartData = mapTypeToData[chartType];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-full p-5 rounded-3xl bg-chat-card",
        className
      )}
    >
      <p className="text-sm font-medium text-primary-foreground">Bitcoin</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <IconWrapper />
          <p className="text-2xl font-semibold">
            <span className="text-primary-foreground">$</span>
            103.594
          </p>
        </div>
        <div className="flex items-center gap-1 bg-primary rounded-full px-2 py-1.5">
          <ChevronUpIcon />
          <span className="text-sm font-semibold">+7.12%</span>
        </div>
      </div>
      <ChartContainer
        className="w-full rounded-3xl bg-primary"
        config={chartConfig}
      >
        <LineChart accessibilityLayer data={chartData}>
          {/* <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          /> */}
          <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide={true} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="price"
            type="natural"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <div className="flex items-center justify-between">
        {xAxisData.map((item) => (
          <div
            key={item.type}
            className={cn(
              "text-base font-semibold cursor-pointer p-2.5 rounded-full",
              chartType === item.type && "bg-primary"
            )}
            onClick={() => setChartType(item.type as ChartType)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
