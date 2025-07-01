import {
  AnalyticsFilters,
  MonthlyBudgetCard,
  SpendingCategoriesList,
  SpendingChart,
  chartDataMock,
  filtersMock,
  monthlyBudgetMock,
  spendingCategoriesMock
} from "@/features/analytics";
import { Header } from "@/shared/ui/header";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const AnalyticsPage = () => {
  return (
    <div className="mx-5 grid h-full">
      <Header leftElement={<SidebarTrigger />} title="Analytics" />

      <ScrollArea className="my-4.5 pr-3.5 -mr-3.5 min-h-0">
        <div className="flex flex-col gap-6">
          {/* Filters */}
          <AnalyticsFilters filters={filtersMock} />

          {/* Spending Chart */}
          <SpendingChart data={chartDataMock} totalSpend="$50" />

          {/* Monthly Budget Card */}
          <MonthlyBudgetCard budget={monthlyBudgetMock} />

          {/* Spending Categories */}
          <SpendingCategoriesList categories={spendingCategoriesMock} />
        </div>
      </ScrollArea>
    </div>
  );
};

export const Component = AnalyticsPage;
