import { AppSidebar } from "@/features/sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/kit/sidebar";
import { Outlet, useMatch } from "react-router-dom";

export function App() {
  const isDemoPage = useMatch("/demo");

  if (isDemoPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grid grid-rows-[auto_1fr] h-screen bg-white flex-none">
        {/* Header */}
        <div className="px-3 pt-11">
          <SidebarTrigger />
        </div>

        <Outlet />
      </main>
    </SidebarProvider>
  );
}
