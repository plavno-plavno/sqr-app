import { useChatStore } from "@/features/chat";
import { AppSidebar } from "@/features/sidebar";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/kit/sidebar";
import { Outlet, useMatch, useParams } from "react-router-dom";

const getPageTitle = (
  isChatPage: boolean,
  isTransactionsPage: boolean,
  chatTitle: string | undefined
) => {
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
  const { chatId } = useParams<PathParams[typeof ROUTES.CHAT]>();

  if (isDemoPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  const title = getPageTitle(
    !!isChatPage,
    !!isTransactionsPage,
    chats[chatId ?? ""]?.title
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-dvh grid grid-rows-[auto_1fr] bg-white">
        {/* Header */}
        <div className="flex-none flex items-center relative px-3 py-5">
          <SidebarTrigger />
          <h3 className="w-[calc(100%-136px)] text-center text-sm font-semibold absolute left-1/2 -translate-x-1/2 truncate">
            {title}
          </h3>
        </div>

        {/* Content */}
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
