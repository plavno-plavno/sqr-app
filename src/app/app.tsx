import { useChatStore } from "@/features/chat";
import { AppSidebar } from "@/features/sidebar";
import { ROUTES } from "@/shared/model/routes";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/kit/sidebar";
import { Outlet, useMatch, useParams } from "react-router-dom";

const getPageTitle = (isChatPage: boolean, isTransactionsPage: boolean, chatTitle: string | undefined) => {
  if (isTransactionsPage) {
    return "Payments";
  }
  if (isChatPage) {
    return chatTitle;
  }
  return "";
};

export function App() {
  const chats = useChatStore.use.chats();
  const isDemoPage = useMatch(ROUTES.DEMO);
  const isTransactionsPage = useMatch(ROUTES.PAYMENTS);
  const isChatPage = useMatch(ROUTES.CHAT);
  const { chatId } = useParams();

  if (isDemoPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  const title = getPageTitle(!!isChatPage, !!isTransactionsPage, chats[chatId ?? ""]?.title);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full grid grid-rows-[auto_1fr] bg-white flex-none">
        {/* Header */}
        <div className="flex items-center relative px-3 pt-11">
          <SidebarTrigger />
          <h3 className="text-sm font-semibold absolute left-1/2 -translate-x-1/2">
            {title}
          </h3>
        </div>

        <Outlet />
      </main>
    </SidebarProvider>
  );
}
