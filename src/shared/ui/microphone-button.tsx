import { Mic, MicOff } from "lucide-react";
import { Button } from "./kit/button";
import { cn } from "@/shared/lib/css/tailwind";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isLoading: boolean;
  handleClick: () => void;
}

export const MicrophoneButton = ({
  isRecording,
  isLoading,
  handleClick,
}: MicrophoneButtonProps) => {

  return (
    <div className="flex flex-col justify-center items-center">
      {/* {`${audioManagerRef?.current?.speechDuration}`} */}
      {/* {audioManagerRef?.current?.isVoiceActive ? <h1>Voice is active</h1> : <h1>Voice is not active</h1>} */}
      <Button
        size="lg"
        className={cn(
          "border-1 border-white rounded-full hover:border-blue-500 w-10 h-10 !p-0",
          isRecording
            ? "!border !border-red-500 !bg-transparent !text-red-500"
            : "!bg-transparent !text-white"
        )}
        onClick={handleClick}
        variant={isRecording ? "destructive" : "default"}
        loading={isLoading}
      >
        {isRecording ? <Mic className="size-4" /> : <MicOff className="size-4" />}
      </Button>
    </div>
  );
};
