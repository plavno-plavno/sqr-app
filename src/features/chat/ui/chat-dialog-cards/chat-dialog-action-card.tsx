import { cn } from "@/shared/lib/css/tailwind";
import {
  formatDateToMonthDay,
  formatDateToTime,
} from "@/shared/lib/js/date-utils";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import VoiceVisualizationImage from "../../../../../public/images/voice-visualization.png";
import { ChatDialogCardLayout } from "./chat-dialog-card-layout";

const RowWithIcon = ({
  firstLine,
  secondLine,
}: {
  firstLine?: string;
  secondLine?: string;
}) => {
  return (
    <div className="flex gap-3 items-center">
      <IconWrapper />
      <div className="flex flex-col gap-px">
        {firstLine && <p className="text-2xl font-semibold">{firstLine}</p>}
        {secondLine && (
          <p className="text-lg font-medium text-primary-foreground">
            {secondLine}
          </p>
        )}
      </div>
    </div>
  );
};

export const ChatDialogActionCardRecipient = ({
  name,
  phone,
  date,
  className,
}: {
  name: string;
  phone: string;
  date?: Date;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium text-primary-foreground">Recipient</p>

      <RowWithIcon firstLine={name} secondLine={phone} />

      {date && (
        <RowWithIcon
          firstLine={formatDateToMonthDay(date)}
          secondLine={formatDateToTime(date)}
        />
      )}
    </div>
  );
};

export const ChatDialogActionCardBuy = ({
  amount,
  coin,
  className,
}: {
  amount: number;
  coin: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium text-primary-foreground">Buy</p>

      <RowWithIcon firstLine={`${amount} ${coin}`} />
    </div>
  );
};

export const ChatDialogActionCardAmount = ({
  amount,
  restAmount,
  className,
}: {
  amount: number;
  restAmount: number;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm font-medium text-primary-foreground">Amount</p>

      <div className="flex justify-between items-end">
        <p className="text-[32px] font-semibold">
          <span className="text-primary-foreground">$</span>
          {amount}
        </p>
        <p className="text-base font-semibold text-foreground/50">
          <span className="text-primary-foreground/50">$</span>
          {restAmount}
        </p>
      </div>
    </div>
  );
};

export const ChatDialogActionCardDetails = ({
  details,
  className,
}: {
  details: {
    name: string;
    value: string;
  }[];
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-medium text-primary-foreground">Transfer details</p>

      <div className="flex flex-col gap-2">
        {details.map((detail) => (
          <div key={detail.name}>
            <p className="text-base font-medium">{detail.name}:</p>
            <p className="text-base font-light">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ChatDialogActionCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <ChatDialogCardLayout className={cn(className)}>
      {children}
      <img src={VoiceVisualizationImage} alt="Voice Vizualization Image" />
    </ChatDialogCardLayout>
  );
}
