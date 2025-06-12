import { cn } from "@/shared/lib/css/tailwind";
import { MicIcon } from "@/shared/ui/icons/MicIcon";
import { PlusIcon } from "@/shared/ui/icons/PlusIcon";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { useRef, useState, type FormEvent } from "react";

interface ChatInputProps {
  className?: string;
  showPlaceholder?: boolean;
  onSubmit: (prompt: string) => void;
}

export function ChatInput({
  className,
  showPlaceholder = true,
  onSubmit,
}: ChatInputProps) {
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextClick = () => {
    setIsInputActive(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (!prompt) return;

    onSubmit(prompt);
    e.currentTarget.reset();
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center w-full gap-2",
        className
      )}
    >
      <Button className="flex-none" variant="ghost" size="icon">
        <PlusIcon />
      </Button>

      <form onSubmit={handleSubmit}>
        {isInputActive || !showPlaceholder ? (
          <Input
            size="lg"
            className="flex-1 w-full"
            type="text"
            name="prompt"
            ref={inputRef}
          />
        ) : (
          <p
            className="text-2xl font-medium text-muted-foreground text-center"
            onClick={handleTextClick}
          >
            Tap to type
          </p>
        )}
      </form>

      <Button className="flex-none" variant="ghost" size="icon">
        <MicIcon />
      </Button>
    </div>
  );
}
