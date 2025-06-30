import { cn } from "../lib/css/tailwind";
import { Button } from "./kit/button";
import EditBlackIcon from "@/shared/assets/icons/edit-black-icon.svg?react";
import ChevronLeftIcon from "@/shared/assets/icons/chevron-left-icon.svg?react";
import PlusBlackIcon from "@/shared/assets/icons/plus-black-icon.svg?react";
import { useNavigate } from "react-router-dom";

export function NewChatHeaderButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", className)}
      onClick={onClick}
    >
      <EditBlackIcon />
    </Button>
  );
}

export function BackHeaderButton({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", className)}
      onClick={() => navigate(-1)}
    >
      <ChevronLeftIcon />
    </Button>
  );
}

export function PlusHeaderButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10 bg-primary", className)}
      onClick={onClick}
    >
      <PlusBlackIcon />
    </Button>
  );
}

export interface HeaderProps {
  title?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
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
      <h3 className="w-[calc(100%-136px)] text-center text-sm font-semibold absolute left-1/2 -translate-x-1/2 truncate">
        {title}
      </h3>
      {rightElement}
    </div>
  );
}
