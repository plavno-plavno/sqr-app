import { ChatHistoryList } from "@/features/chat";
import { ROUTES } from "@/shared/model/routes";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import { AccountIcon } from "@/shared/ui/icons/AccountIcon";
import { AnalyticsIcon } from "@/shared/ui/icons/AnalyticsIcon";
import { CardIcon } from "@/shared/ui/icons/CardIcon";
import { EditIcon } from "@/shared/ui/icons/EditIcon";
import { PaymentIcon } from "@/shared/ui/icons/PaymentIcon";
import { SettingsIcon } from "@/shared/ui/icons/SettingsIcon";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/kit/sidebar";
import { Link } from "react-router-dom";

const items = [
  {
    title: "Accounts",
    url: "#",
    icon: <AccountIcon />,
  },
  {
    title: "Cards",
    url: "#",
    icon: <CardIcon />,
  },
  {
    title: "Payments",
    url: ROUTES.PAYMENTS,
    icon: <PaymentIcon />,
  },
  {
    title: "Analytics",
    url: "#",
    icon: <AnalyticsIcon />,
  },
  {
    title: "Settings",
    url: "#",
    icon: <SettingsIcon />,
  },
  {
    title: "Demo",
    url: ROUTES.DEMO,
    icon: <SettingsIcon />,
  },
];

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="pt-12">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between px-8 py-2">
            <div className="flex items-center gap-[14px]">
              <IconWrapper radius="base" />
              <span className="text-2xl font-medium">Ryan</span>
            </div>

            <IconWrapper radius="base">
              <EditIcon />
            </IconWrapper>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-10 pt-8">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size="lg" asChild className="px-8 py-2">
                    <Link to={item.url} onClick={toggleSidebar}>
                      <IconWrapper radius="base">{item.icon}</IconWrapper>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="flex flex-col gap-4 px-8">
          <SidebarGroupLabel className="h-[17px]">Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChatHistoryList onCardClick={toggleSidebar} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
