import MicIcon from "@/shared/assets/icons/mic-icon.svg?react";
import PlusIcon from "@/shared/assets/icons/plus-icon.svg?react";
import SendIcon from "@/shared/assets/icons/send-icon.svg?react";
import { cn } from "@/shared/lib/css/tailwind";
import { isMobileDevice } from "@/shared/lib/js/common";
import { Button } from "@/shared/ui/kit/button";
import { Textarea } from "@/shared/ui/kit/textarea";
import { X } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  className?: string;
  showPlaceholder?: boolean;
  onSubmit: (prompt: string, image?: ImageState) => void;
}

export interface ImageState {
  imageFile?: File;
  imagePreview?: string;
}

export function ChatInput({
  className,
  showPlaceholder = true,
  onSubmit,
}: ChatInputProps) {
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [imageState, setImageState] = useState<ImageState>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setIsInputActive(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      setImageState({ imageFile: file, imagePreview: preview });
    };
    reader.readAsDataURL(file);
  };

  const handleTextClick = () => {
    setIsInputActive(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const isMobile = isMobileDevice();

    if (isMobile) {
      return;
    }

    if (!e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value && !imageState) return;

    // Capture current values before clearing
    const currentValue = value;
    const currentImageState = imageState;

    // Clear state immediately in multiple ways
    setValue("");
    setImageState(undefined);

    // // Force DOM update
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Call onSubmit after clearing state
    onSubmit(currentValue, currentImageState);

    // Force re-render with timeout
    setTimeout(() => {
      setValue("");
      setImageState(undefined);
      adjustTextareaHeight();
    }, 0);
  };

  return (
    <div className={cn("flex justify-between items-end gap-2", className)}>
      <Button
        className="flex-none h-10 w-10"
        variant="ghost"
        size="icon"
        onClick={triggerFileInput}
      >
        <PlusIcon />
      </Button>

      <div className="flex-1 flex flex-col gap-2">
        {imageState?.imagePreview && (
          <div className="flex items-center justify-center w-15 h-15 aspect-square rounded-xl overflow-hidden relative border">
            <img
              src={imageState.imagePreview}
              className="w-full h-full object-contain"
              alt="Preview"
            />
            <Button
              type="button"
              onClick={() => {
                console.log("clicked");
                setImageState(undefined);
              }}
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 w-4 h-4"
            >
              <X width={8} height={8} />
            </Button>
          </div>
        )}

        {isInputActive || !showPlaceholder ? (
          <Textarea
            className="w-full min-h-10 max-h-24 resize-none break-all overflow-auto"
            name="prompt"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustTextareaHeight();
            }}
            ref={inputRef}
            rows={1}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <p
            className="text-2xl h-10 flex items-center justify-center font-medium text-muted-foreground"
            onClick={handleTextClick}
          >
            Tap to type
          </p>
        )}
      </div>

      {value || imageState?.imageFile ? (
        <Button
          onClick={handleSend}
          className="flex-none h-10 w-10"
          variant="ghost"
          size="icon"
        >
          <SendIcon />
        </Button>
      ) : (
        <Button className="flex-none h-10 w-10" variant="ghost" size="icon">
          <MicIcon />
        </Button>
      )}

      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg,image/png,image/jpg"
      />
    </div>
  );
}
