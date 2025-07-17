import { cn } from "@/shared/lib/css/tailwind";
import { Textarea, type TextareaProps } from "./kit/textarea";
import { useRef } from "react";
import { isMobileDevice } from "../lib/js/common";

export type TextareaFromInputProps = TextareaProps & {
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  rootClasses?: string;
  onSubmit?: () => void;
};

export function TextareaFromInput({
  rootClasses,
  leftElement,
  rightElement,
  error,
  onSubmit,
  ...props
}: TextareaFromInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const isMobile = isMobileDevice();

    if (isMobile) return;

    if (!e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", rootClasses)}>
      <div className="flex items-center gap-1">
        {leftElement}
        <Textarea
          className={cn(
            "w-full min-h-10 max-h-24 resize-none overflow-auto wrap-anywhere",
            props.className
          )}
          ref={inputRef}
          onChange={(e) => {
            props.onChange?.(e);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {rightElement}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
