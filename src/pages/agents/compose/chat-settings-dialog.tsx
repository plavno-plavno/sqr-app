import { useChatStore } from "@/features/chat";
import { LanguageSearch, useLanguageStore } from "@/features/language";
import { useSettingsStore } from "@/features/settings";
import { useWSConnection } from "@/features/ws-connection";
import {
  PromptType,
  SameOutputTreshholdValues,
  VocalizerType,
} from "@/shared/model/websocket";
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
import { useNavigate, type NavigateOptions } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Dialog for chat settings using AdaptiveDrawer
export function ChatSettingsDialog({
  open,
  onOpenChange,
  agentName,
  currentAgent,
  searchParams,
  setSearchParams,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: PromptType;
  currentAgent: PromptType;
  searchParams: URLSearchParams;
  setSearchParams: (params: Record<string, string>, options?: NavigateOptions) => void;
}) {
  const navigate = useNavigate();
  const createChat = useChatStore.use.createChat();

  const language = useLanguageStore.use.language();
  const isAudioEnabled = useSettingsStore.use.isAudioEnabled();
  const setAudioEnabled = useSettingsStore.use.setAudioEnabled();
  const vocalizerType = useSettingsStore.use.vocalizerType();
  const setVocalizerType = useSettingsStore.use.setVocalizerType();
  const sameOutputTreshhold = useSettingsStore.use.sameOutputTreshhold();
  const setSameOutputTreshhold = useSettingsStore.use.setSameOutputTreshhold();
  const intentDetection = useSettingsStore.use.intentDetection();
  const setIntentDetection = useSettingsStore.use.setIntentDetection();
  const {
    sendSwitchVocalizerCommand,
    sendToggleIntentCommand,
    sendToggleAudioCommand,
    changeLanguage,
    changeSameOutputTreshhold,
    sendSwitchPromptCommand,
  } = useWSConnection(undefined);

  const handleChangeVocalizer = (value: VocalizerType) => {
    setVocalizerType(value);
    sendSwitchVocalizerCommand(value);

    // Update URL to include vocalizerType
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, vocalizerType: value });
  };

  const handleChangePrompt = (value: PromptType) => {
    // Create new chat for the new agent
    const newChatId = uuidv4();
    createChat(newChatId);

    // Navigate to new URL with new agent
    navigate(`/agent/${value}?chatId=${newChatId}`);
    sendSwitchPromptCommand(value);

    // Close the dialog
    onOpenChange(false);
  };

  const handleChangeSameOutputTreshhold = (value: number) => {
    setSameOutputTreshhold(value);
    changeSameOutputTreshhold(value);
  };

  const handleChangeIntent = (value: boolean) => {
    setIntentDetection(value);
    sendToggleIntentCommand(value);
  };

  const handleChangeAudio = (value: boolean) => {
    setAudioEnabled(value);
    sendToggleAudioCommand(value);
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
          <Select value={currentAgent ? currentAgent : agentName} onValueChange={handleChangePrompt}>
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

        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">
            Same Output Treshhold
          </label>
          <Select
            value={sameOutputTreshhold.toString()}
            onValueChange={(value) => handleChangeSameOutputTreshhold(+value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Same Output Treshhold" />
            </SelectTrigger>
            <SelectContent>
              {SameOutputTreshholdValues.map((treshhold) => (
                <SelectItem key={treshhold} value={treshhold.toString()}>
                  {treshhold}
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
            onLanguageSelect={(language) => {
              changeLanguage(language.code);

              // Update URL to include language
              const currentParams = Object.fromEntries(searchParams.entries());
              setSearchParams({ ...currentParams, language: language.code });
            }}
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
            onCheckedChange={handleChangeAudio}
          />
        </div>
      </div>
    </AdaptiveDrawer>
  );
}
