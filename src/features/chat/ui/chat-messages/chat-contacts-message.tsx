import { cn } from "@/shared/lib/css/tailwind";

interface ChatContactsMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatContactsMessage({
  children,
  className,
}: ChatContactsMessageProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      <p className="text-2xl wrap-anywhere text-agent-message-foreground whitespace-pre-wrap">
        Where would you like to transfer to?
      </p>
      {children}
      <p className="text-2xl wrap-anywhere text-agent-message-foreground whitespace-pre-wrap">
        Or write your credit card or IBAN details.
      </p>
    </div>
  );
}
