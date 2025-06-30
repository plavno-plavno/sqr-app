import { BankAccountsList, bankAccountsMock } from "@/features/finance";
import { AdaptiveDrawer } from "@/shared/ui/adaptive-drawer";
import { Header, PlusHeaderButton } from "@/shared/ui/header";
import { Button } from "@/shared/ui/kit/button";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";
import { useState } from "react";

const FinancePage = () => {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <div className="mx-5">
      <Header
        title="Finance"
        leftElement={<SidebarTrigger />}
        rightElement={<PlusHeaderButton onClick={() => setOpenDrawer(true)} />}
      />
      <BankAccountsList accounts={bankAccountsMock} />

      <AdaptiveDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        title="Add new"
      >
        <div className="flex flex-col gap-2 my-7.5">
          <Button size="lg">Card</Button>
          <Button size="lg" variant="secondary">Account</Button>
        </div>
      </AdaptiveDrawer>
    </div>
  );
};

export const Component = FinancePage;
