import { useChatStore } from "@/features/chat";
import { AppSidebar } from "@/features/sidebar";
import { ROUTES } from "@/shared/model/routes";
import { SidebarProvider } from "@/shared/ui/kit/sidebar";
import {
  href,
  Outlet,
  useMatch,
  useNavigate
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export function App() {
  const isDemoPage = useMatch(ROUTES.DEMO);
  const createChat = useChatStore.use.createChat();
  const navigate = useNavigate();

  const onNewChatClick = () => {
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.CHAT, { chatId })}`);
  };

  if (isDemoPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar onNewChatClick={onNewChatClick} />
      <main className="w-full h-dvh bg-white">
        {/* Content */}
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
