import { CarouselItem } from "@/shared/ui/kit/carousel";
import { ShiftedCarousel } from "@/shared/ui/shifted-carousel";
import { type Contact } from "../model/contacts";
import { ContactCard } from "../ui/contact-card";

interface ContactsCarouselProps {
  contacts: Contact[];
  disabled?: boolean;
  className?: string;
  onContactClick: (contact: Contact) => void;
}

export function ContactsCarousel({
  contacts,
  disabled,
  className,
  onContactClick,
}: ContactsCarouselProps) {
  return (
    <ShiftedCarousel className={className}>
      {contacts.map((contact) => (
        <CarouselItem className="basis-2/3 pl-2" key={contact.id}>
          <ContactCard
            contact={contact}
            disabled={disabled}
            onClick={() => onContactClick(contact)}
          />
        </CarouselItem>
      ))}
    </ShiftedCarousel>
  );
}
