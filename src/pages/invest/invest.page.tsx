import {
  InvestList,
  InvestSummaryCard,
  useInvestmentStore,
} from "@/features/invest";
import { Header } from "@/shared/ui/header";
import { Button } from "@/shared/ui/kit/button";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const InvestPage = () => {
  const totalValueInUSD = useInvestmentStore.use.getTotalValueInUSD();
  const investments = useInvestmentStore.use.investments();
  const change = useInvestmentStore.use.change();

  return (
    <div className="mx-5 grid h-full grid-rows-[auto_1fr_auto]">
      <Header leftElement={<SidebarTrigger />} title="Invest" />

      <div className="flex flex-col gap-10 mt-5">
        <InvestSummaryCard
          summary={{
            amount: totalValueInUSD(),
            change: change,
          }}
        />

        <InvestList investments={investments} />
      </div>

      <Button size="lg" className="mb-5">
        Invest
      </Button>
    </div>
  );
};

export const Component = InvestPage;
