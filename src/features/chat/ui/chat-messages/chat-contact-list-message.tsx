import { cn } from "@/shared/lib/css/tailwind";
import type { Contact } from "../../model/contact";

interface ChatContactListMessageProps {
  contacts: Contact[];
  className?: string;
}

export function ChatContactListMessage({
  contacts,
  className,
}: ChatContactListMessageProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {contacts.map((contact) => (
        <div key={contact.id} className="bg-background rounded-xl p-4">
          <p className="text-base font-semibold">{contact.name}</p>
          <p className="text-xs font-medium text-foreground/50">
            {contact.phone}
          </p>
        </div>
      ))}
    </div>
  );
}
