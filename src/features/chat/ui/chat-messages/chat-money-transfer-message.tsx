import { cn } from "@/shared/lib/css/tailwind";
import { formatDateToMonthDay, formatDateToTime } from "@/shared/lib/js/date-utils";
import { useTranslation } from "react-i18next";

interface ChatMoneyTransferMessageProps {
  amount: string;
  recipient: string;
  phone?: string;
  date: Date;
  className?: string;
}

export function ChatMoneyTransferMessage({
  amount,
  recipient,
  phone,
  date,
  className,
}: ChatMoneyTransferMessageProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex flex-col rounded-4xl p-8 gap-2.5 bg-chat-card",
        className
      )}
    >
      <p className="text-[40px] font-semibold">{amount}</p>
      <div className="flex gap-2.5">
        <div className="flex-1 flex flex-col gap-0.5">
          <p className="text-sm font-medium text-primary-foreground">{t('chat.sendTo')}</p>
          <p className="text-2xl font-semibold">{recipient}</p>
          {phone && <p className="text-lg font-medium text-primary-foreground">{phone}</p>}
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <p className="text-sm font-medium text-primary-foreground">
            {t('chat.dateAndTime')}
          </p>
          <p className="text-2xl font-semibold">
            {formatDateToMonthDay(date)}
          </p>
          <p className="text-lg font-medium text-primary-foreground">
            {formatDateToTime(date)}
          </p>
        </div>
      </div>
    </div>
  );
}
