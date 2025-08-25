import { LanguageSearch, useLanguageStore } from "@/features/language";
import { useSettingsStore } from "@/features/settings";
import { useWSConnection } from "@/features/ws-connection";
import { PromptType, VocalizerType } from "@/shared/model/websocket";
import { AdaptiveDrawer } from "@/shared/ui/adaptive-drawer";
import { Button } from "@/shared/ui/kit/button";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { Switch } from "@/shared/ui/kit/switch";
import { LanguagesIcon } from "lucide-react";

// Dialog for chat settings using AdaptiveDrawer
export function ChatSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const language = useLanguageStore.use.language();
  const isAudioEnabled = useSettingsStore.use.isAudioEnabled();
  const setAudioEnabled = useSettingsStore.use.setAudioEnabled();
  const vocalizerType = useSettingsStore.use.vocalizerType();
  const setVocalizerType = useSettingsStore.use.setVocalizerType();
  const promptType = useSettingsStore.use.promptType();
  const setPromptType = useSettingsStore.use.setPromptType();
  const intentDetection = useSettingsStore.use.intentDetection();
  const setIntentDetection = useSettingsStore.use.setIntentDetection();
  const {
    sendSwitchVocalizerCommand,
    sendSwitchPromptCommand,
    sendToggleIntentCommand,
    changeLanguage,
  } = useWSConnection();

  const handleChangeVocalizer = (value: VocalizerType) => {
    setVocalizerType(value);
    sendSwitchVocalizerCommand(value);
  };

  const handleChangePrompt = (value: PromptType) => {
    setPromptType(value);
    sendSwitchPromptCommand(value);
  };

  const handleChangeIntent = (value: boolean) => {
    setIntentDetection(value);
    sendToggleIntentCommand(value);
  };

  return (
    <AdaptiveDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Chat Settings"
    >
      <div className="flex flex-col gap-4 mt-4 mb-8">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">
            Vocalizer Type
          </label>
          <Select value={vocalizerType} onValueChange={handleChangeVocalizer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Vocalizer" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(VocalizerType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">
            Prompt Type
          </label>
          <Select value={promptType} onValueChange={handleChangePrompt}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Prompt" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PromptType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Checkbox
            id="intentDetection"
            checked={intentDetection}
            onCheckedChange={handleChangeIntent}
          />
          <label htmlFor="intentDetection" className="text-sm">
            Intent detection
          </label>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-muted-foreground font-medium">
            Language - <b className="text-foreground">{language.name}</b>
          </label>
          <LanguageSearch
            onLanguageSelect={(language) => changeLanguage(language.code)}
            trigger={
              <Button variant="outline">
                <LanguagesIcon />
                Change
              </Button>
            }
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-muted-foreground font-medium">
            Audio -{" "}
            <b className="text-foreground">
              {isAudioEnabled ? "enabled" : "disabled"}
            </b>
          </label>
          <Switch
            size="lg"
            checked={isAudioEnabled}
            onCheckedChange={setAudioEnabled}
          />
        </div>
      </div>
    </AdaptiveDrawer>
  );
}
