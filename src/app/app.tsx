import { ChatHistoryList, useChatStore } from "@/features/chat";
import { AppSidebar } from "@/features/sidebar";
import { useAudio } from "@/features/ws-connection";
import {type PathParams, ROUTES} from "@/shared/model/routes";
import { SidebarProvider, useSidebar } from "@/shared/ui/kit/sidebar";
import {href, Outlet, useLocation, useMatch, useNavigate, useParams} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./i18n"; // Initialize i18n
import { useLanguageSync } from "./i18n";
import {useEffect} from "react";

function AppContent() {
  // Sync language changes
  useLanguageSync(); 

  const createChat = useChatStore.use.createChat();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { stopRecording } = useAudio();
  const {agentName} = useParams<PathParams[typeof ROUTES.AGENT]>();

  const onNewChatClick = async () => {
    await stopRecording();
    const chatId = uuidv4();
    createChat(chatId);
    navigate(`${href(ROUTES.AGENT, { agentName: agentName || 'default', chatId })}`);
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
  const isAppTestPage = useMatch(ROUTES.APP_TEST);
  const location = useLocation();
  const {agentName} = useParams<{agentName: string; chatId: string}>();
  const navigate = useNavigate();
  const createChat = useChatStore.use.createChat();
  const chats = useChatStore.use.chats();

  useEffect(() => {
    if(location.pathname === '/agent' && !agentName){
      if(!Object.keys(chats).length) {
        const chatId = uuidv4();
        createChat(chatId);

        navigate(`/agent/default/${chatId}`);
      }else{
        const lastChatId = Object.keys(chats).at(-1);
        navigate(`/agent/default/${lastChatId}`);
      }
    }
  }, [location]);

  if (isDemoPage || isAppTestPage) {
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
