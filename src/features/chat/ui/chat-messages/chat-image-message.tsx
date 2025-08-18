import { cn } from "@/shared/lib/css/tailwind";
import { useTranslation } from "react-i18next";

interface ChatImageMessageProps {
  image: string;
  className?: string;
}

export function ChatImageMessage({ image, className }: ChatImageMessageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex rounded-3xl p-4 bg-chat-card max-w-[65%]">
      <img
        src={image}
        alt={t('chat.imageAlt')}
        className={cn("w-full h-full object-contain rounded-2xl", className)}
      />
    </div>
  );
}
