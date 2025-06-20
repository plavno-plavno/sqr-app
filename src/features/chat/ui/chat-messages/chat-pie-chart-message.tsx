"use client";

import { Pie, PieChart } from "recharts";

import ChevronUpIcon from "@/shared/assets/icons/chevron-up-icon.svg?react";
import { cn } from "@/shared/lib/css/tailwind";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/kit/chart";
import type { PieChartConfig, PieChartData } from "../../model/chart";

interface ChatPieChartMessageProps {
  title: string;
  titleBoldPart: string;
  amount: string;
  chartData: PieChartData[];
  chartConfig: PieChartConfig;
  dataKey: string;
  nameKey: string;
  valueSign?: string;
  className?: string;
}

export function ChatPieChartMessage({
  title,
  titleBoldPart,
  amount,
  chartData,
  chartConfig,
  dataKey,
  nameKey,
  valueSign,
  className,
}: ChatPieChartMessageProps) {
  const chartDataColored = chartData?.map(
    (item) =>
      ({
        ...item,
        fill: chartConfig?.[item[nameKey].toString()]?.color,
      } as Record<string, string | number | boolean>)
  );

  return (
    <div
      className={cn(
        "flex flex-col w-full p-8 rounded-4xl bg-chat-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary-foreground">
          {title} <span className="text-foreground">{titleBoldPart}</span>
        </p>
        <p className="text-2xl font-semibold">
          <span className="text-primary-foreground">$</span>
          {amount}
        </p>
      </div>

      <ChartContainer className="h-[148px] self-center" config={chartConfig}>
        <PieChart width={100} height={100}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartDataColored}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius={50}
            innerRadius={38}
          />
        </PieChart>
      </ChartContainer>

      <div className="flex gap-2 flex-wrap">
        {chartDataColored.map((item) => (
          <div
            key={item?.[nameKey]?.toString()}
            className={cn("flex items-center py-1 px-3 gap-1 rounded-full")}
            style={{
              backgroundColor: item.fill as string,
            }}
          >
            <span className="text-xs font-medium">
              {chartConfig?.[item[nameKey].toString()]?.label}
            </span>
            <span className="text-xs font-semibold">
              {valueSign}
              {item?.[dataKey]}
            </span>
            {item.trend === "up" && <ChevronUpIcon />}
            {item.trend === "down" && <ChevronUpIcon className="rotate-180" />}
          </div>
        ))}
      </div>
    </div>
  );
}
