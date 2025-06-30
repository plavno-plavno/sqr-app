import { Line, LineChart, XAxis, YAxis } from "recharts";

import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import ChevronUpIcon from "@/shared/assets/icons/chevron-up-icon.svg?react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/kit/chart";
import { useState } from "react";
import type { LineChartData } from "../../model/chart";

const xAxisData = [
  { type: "day", label: "1D" },
  { type: "week", label: "1W" },
  { type: "month", label: "1M" },
  { type: "year", label: "1Y" },
  { type: "all", label: "All" },
];

export enum PeriodType {
  SINGLE = "single",
  MULTIPLE = "multiple",
}

interface MultiplePeriodsData {
  chartData: LineChartData;
  period: PeriodType.MULTIPLE;
}
interface SinglePeriodData {
  chartData: Record<string, string | number>[];
  period: PeriodType.SINGLE;
}

type BaseProps = {
  currentPrice: number;
  valueKey: string;
  xAxisKey?: string;
  yAxisKey?: string;
  className?: string;
}

type SinglePeriodProps = BaseProps & SinglePeriodData;
type MultiplePeriodsProps = BaseProps & MultiplePeriodsData;

type ChatLineChartMessageProps = SinglePeriodProps | MultiplePeriodsProps;

export function ChatLineChartMessage({
  chartData,
  currentPrice,
  period,
  className,
  valueKey,
  xAxisKey,
  yAxisKey,
}: ChatLineChartMessageProps) {
  const [chartType, setChartType] = useState<keyof LineChartData>("month");
  const data = period === PeriodType.SINGLE ? chartData : chartData[chartType];

  const chartConfig = {
    [valueKey]: {
      label: valueKey,
      color: "var(--chart-0)",
    },
  } satisfies ChartConfig;

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
            {currentPrice}
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
        <LineChart accessibilityLayer data={data}>
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            hide={true}
          />
          <YAxis
            dataKey={yAxisKey}
            domain={["dataMin - 10", "dataMax + 10"]}
            hide={true}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey={valueKey}
            type="natural"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      {period === PeriodType.MULTIPLE && (
        <div className="flex items-center justify-between">
          {xAxisData.map((item) => (
            <div
              key={item.type}
              className={cn(
                "text-base font-semibold cursor-pointer p-2.5 rounded-full",
                chartType === item.type && "bg-primary"
              )}
              onClick={() => setChartType(item.type as keyof LineChartData)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
