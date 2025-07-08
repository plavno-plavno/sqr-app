import { cn } from "@/shared/lib/css/tailwind";
import type { Contact } from "../model/contacts";

interface ContactCardProps {
  contact: Contact;
  className?: string;
  onClick?: (contact: Contact) => void;
}

export function ContactCard({ contact, className, onClick }: ContactCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-px bg-background rounded-xl p-4 cursor-pointer",
        className
      )}
      onClick={() => onClick?.(contact)}
    >
      <p className="text-base text-foreground font-semibold">{contact.name}</p>
      <p className="text-sm text-foreground/50 font-medium">{contact.phone}</p>
    </div>
  );
}
