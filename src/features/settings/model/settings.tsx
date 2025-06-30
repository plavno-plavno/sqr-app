import HelpIcon from "@/shared/assets/icons/help-icon.svg?react";
import ShieldIcon from "@/shared/assets/icons/shield-icon.svg?react";
import BellIcon from "@/shared/assets/icons/bell-icon.svg?react";
import LogoutIcon from "@/shared/assets/icons/logout-icon.svg?react";
import { v4 as uuidv4 } from "uuid";

export interface SettingsItemType {
  id: string;
  title: string;
  icon: React.ReactNode;
}

// Mock data for settings items
export const settingsMock: SettingsItemType[] = [
  {
    id: uuidv4(),
    title: "Help",
    icon: <HelpIcon />,
  },
  {
    id: uuidv4(),
    title: "Security and Privacy",
    icon: <ShieldIcon />,
  },
  {
    id: uuidv4(),
    title: "Notification settings",
    icon: <BellIcon />,
  },
  {
    id: uuidv4(),
    title: "Logout",
    icon: <LogoutIcon />,
  },
];
