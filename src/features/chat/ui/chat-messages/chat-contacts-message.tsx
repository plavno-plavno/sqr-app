import { cn } from "@/shared/lib/css/tailwind";
import { useTranslation } from "react-i18next";

interface ChatContactsMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatContactsMessage({
  children,
  className,
}: ChatContactsMessageProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("grid gap-4", className)}>
      <p className="text-2xl wrap-anywhere text-agent-message-foreground whitespace-pre-wrap">
        {t('chat.transferToQuestion')}
      </p>
      {children}
      <p className="text-2xl wrap-anywhere text-agent-message-foreground whitespace-pre-wrap">
        {t('chat.cardIbanDetails')}
      </p>
    </div>
  );
}
