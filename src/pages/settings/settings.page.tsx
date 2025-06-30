import { SettingsList, settingsMock } from "@/features/settings";
import { Header } from "@/shared/ui/header";
import { SidebarTrigger } from "@/shared/ui/kit/sidebar";

const SettingsPage = () => {
  return (
    <div className="mx-5">
      <Header leftElement={<SidebarTrigger />} title="Settings" />

      <SettingsList items={settingsMock} className="mt-6" />
    </div>
  );
};

export const Component = SettingsPage;
