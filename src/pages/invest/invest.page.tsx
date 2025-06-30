import {
  InvestList,
  investMock,
  InvestSummaryCard,
  investSummaryMock,
} from "@/features/invest";
import { Header } from "@/shared/ui/header";
import { Button } from "@/shared/ui/kit/button";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const InvestPage = () => {
  return (
    <div className="mx-5 grid h-full grid-rows-[auto_1fr_auto]">
      <Header leftElement={<SidebarTrigger />} title="Invest" />

      <div className="flex flex-col gap-10 mt-5">
        <InvestSummaryCard summary={investSummaryMock} />

        <InvestList investments={investMock} />
      </div>

      <Button size="lg" className="mb-5">
        Invest
      </Button>
    </div>
  );
};

export const Component = InvestPage;
