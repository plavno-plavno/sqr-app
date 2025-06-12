import { cn } from "@/shared/lib/css/tailwind";

interface ChatDialogCardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatDialogCardLayout({
  children,
  className,
}: ChatDialogCardLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5 rounded-3xl bg-chat-card",
        className
      )}
    >
      {children}
    </div>
  );
}
