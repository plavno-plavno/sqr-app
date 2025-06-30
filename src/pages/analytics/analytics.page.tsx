import { Header } from "@/shared/ui/header";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const AnalyticsPage = () => {
  return (
    <div className="mx-5 h-full">
      <Header leftElement={<SidebarTrigger />} title="Analytics" />
    </div>
  );
};

export const Component = AnalyticsPage;
