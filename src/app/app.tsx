import { ChatHistoryList, useChatStore } from "@/features/chat";
import { AppSidebar } from "@/features/sidebar";
import { ROUTES } from "@/shared/model/routes";
import { SidebarProvider, useSidebar } from "@/shared/ui/kit/sidebar";
import { href, Outlet, useMatch, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function AppContent() {
  const createChat = useChatStore.use.createChat();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const onNewChatClick = () => {
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.CHAT, { chatId })}`);
  };

  return (
    <>
      <AppSidebar onNewChatClick={onNewChatClick}>
        <ChatHistoryList onCardClick={toggleSidebar} />
      </AppSidebar>
      <main className="w-full h-dvh bg-white">
        {/* Content */}
        <Outlet />
      </main>
    </>
  );
}

export function App() {
  const isDemoPage = useMatch(ROUTES.DEMO);

  if (isDemoPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppContent />
    </SidebarProvider>
  );
}
