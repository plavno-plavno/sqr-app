import { Area, AreaChart, XAxis } from "recharts";
import { cn } from "@/shared/lib/css/tailwind";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/kit/chart";
import type { ChartDataPoint } from "../model/analytics";

interface SpendingChartProps {
  data: ChartDataPoint[];
  totalSpend: string;
  className?: string;
}

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

export function SpendingChart({
  data,
  totalSpend,
  className,
}: SpendingChartProps) {
  return (
    <div
      className={cn(
        "bg-background rounded-xl p-4",
        className
      )}
    >
      <div className="flex flex-col gap-px">
        <p className="text-sm text-muted-foreground">Total spend</p>
        <p className="text-[32px] font-semibold">{totalSpend}</p>
      </div>

      <ChartContainer config={chartConfig} className="w-full">
        <AreaChart
          accessibilityLayer
          height={120}
          data={data}
        >
          <defs>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(120, 120, 120, 1)" />
              <stop offset="100%" stopColor="rgba(222, 222, 222, 0)" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            className="text-xs font-medium text-foreground/50"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Area
            dataKey="amount"
            stroke="var(--color-chart-6)"
            type="natural"
            fill="url(#fillGradient)"
            dot={false}
            strokeWidth={0}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
} 