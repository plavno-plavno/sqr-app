import { cn } from "../lib/css/tailwind";
import { Button, type ButtonProps } from "./kit/button";
import EditBlackIcon from "@/shared/assets/icons/edit-black-icon.svg?react";
import ChevronLeftIcon from "@/shared/assets/icons/chevron-left-icon.svg?react";
import PlusBlackIcon from "@/shared/assets/icons/plus-black-icon.svg?react";
import { useNavigate } from "react-router-dom";
import { SettingsIcon } from "lucide-react";

export function NewChatHeaderButton({ ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", props.className)}
      {...props}
    >
      <EditBlackIcon />
    </Button>
  );
}

export function BackHeaderButton({ ...props }: ButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", props.className)}
      onClick={() => navigate(-1)}
      {...props}
    >
      <ChevronLeftIcon />
    </Button>
  );
}

export function PlusHeaderButton({ ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", props.className)}
      {...props}
    >
      <PlusBlackIcon />
    </Button>
  );
}

export function SettingsHeaderButton({ ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", props.className)}
      {...props}
    >
      <SettingsIcon className="size-5" />
    </Button>
  );
}

export interface HeaderProps {
  title?: string;
  titleClassName?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  titleClassName,
  leftElement,
  rightElement,
  className,
}: HeaderProps) {
  return (
    <div
      className={cn(
        "flex-none flex items-center relative py-5 justify-between",
        className
      )}
    >
      {leftElement}
      <h3
        className={cn(
          "w-[calc(100%-136px)] text-center text-sm font-semibold absolute left-1/2 -translate-x-1/2 truncate",
          titleClassName
        )}
      >
        {title}
      </h3>
      {rightElement}
    </div>
  );
}
