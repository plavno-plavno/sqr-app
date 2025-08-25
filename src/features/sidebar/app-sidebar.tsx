import EditIcon from "@/shared/assets/icons/edit-icon.svg?react";
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
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/kit/sidebar";
import { Link } from "react-router-dom";

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
            <Link
              to={ROUTES.SETTINGS}
              onClick={toggleSidebar}
              className="flex items-center gap-[14px]"
            >
              <IconWrapper radius="base">
                <SettingsIcon />
              </IconWrapper>
              <span className="text-2xl font-medium">Settings</span>
            </Link>

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
        <SidebarGroup className="flex flex-col gap-4 px-8">
          <SidebarGroupLabel className="h-[17px]">Chats</SidebarGroupLabel>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
