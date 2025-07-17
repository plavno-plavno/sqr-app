import { cn } from "@/shared/lib/css/tailwind";
import { type LanguageOption } from "../model/language";
import { CheckIcon } from "lucide-react";

interface LanguageCardProps {
  language: LanguageOption;
  disabled?: boolean;
  className?: string;
  isSelected?: boolean;
  onClick?: (language: LanguageOption) => void;
}

export function LanguageCard({
  language,
  disabled,
  className,
  isSelected,
  onClick,
}: LanguageCardProps) {
  return (
    <div
      className={cn(
        "w-full p-4 bg-background rounded-xl flex items-center justify-between",
        isSelected && "bg-primary",
        disabled && "opacity-50",
        className
      )}
      onClick={() => onClick?.(language)}
    >
      <p className={"text-lg font-semibold"}>{language.name}</p>
      {isSelected && <CheckIcon />}
    </div>
  );
}
