import AccountIcon from "@/shared/assets/icons/account-icon.svg?react";
import AnalyticsIcon from "@/shared/assets/icons/analytics-icon.svg?react";
import CardIcon from "@/shared/assets/icons/card-icon.svg?react";
import EditIcon from "@/shared/assets/icons/edit-icon.svg?react";
import InvestIcon from "@/shared/assets/icons/invest-icon.svg?react";
import PaymentIcon from "@/shared/assets/icons/payment-icon.svg?react";
import SettingsIcon from "@/shared/assets/icons/settings-icon.svg?react";
import { ROUTES } from "@/shared/model/routes";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
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
    title: "Home",
    url: ROUTES.HOME,
    icon: <AccountIcon />,
  },
  {
    title: "Finance",
    url: ROUTES.FINANCE,
    icon: <CardIcon />,
  },
  {
    title: "Payments",
    url: ROUTES.PAYMENTS,
    icon: <PaymentIcon />,
  },
  {
    title: "Invest",
    url: ROUTES.INVEST,
    icon: <InvestIcon />,
  },
  {
    title: "Analytics",
    url: ROUTES.ANALYTICS,
    icon: <AnalyticsIcon />,
  },
  {
    title: "Settings",
    url: ROUTES.SETTINGS,
    icon: <SettingsIcon />,
  },
];

export function AppSidebar({
  children,
  onNewChatClick,
}: {
  children?: React.ReactNode;
  onNewChatClick?: () => void;
}) {
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

            <IconWrapper
              radius="base"
              className="cursor-pointer"
              onClick={() => {
                onNewChatClick?.();
                toggleSidebar();
              }}
            >
              <EditIcon />
            </IconWrapper>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-10 py-8">
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
            {children}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
