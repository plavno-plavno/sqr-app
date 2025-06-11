import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import { ChatDialogCardLayout } from "./chat-dialog-card-layout";
import { ImageFallbackIcon } from "@/shared/ui/icons/ImageFallbackIcon";

export function ChatDialogPaymentCard({
  title,
  identifier,
  paymentMethod,
  className,
}: {
  title: string;
  identifier: string;
  paymentMethod: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <ChatDialogCardLayout className={cn(className)}>
      <p className="text-sm font-medium text-primary-foreground">{title}</p>

      <div className="grid grid-cols-[auto_auto] justify-between items-center gap-2">
        <p className="text-sm font-semibold truncate">{identifier}</p>
        <div className="flex items-center gap-1 p-1 pl-3 bg-primary rounded-full">
          <p className="text-sm font-semibold">{paymentMethod}</p>
          <IconWrapper className="w-4 h-4 bg-icon-wrapper-secondary">
            <ImageFallbackIcon className="w-1.5 h-1.5" />
          </IconWrapper>
        </div>
      </div>
    </ChatDialogCardLayout>
  );
}
