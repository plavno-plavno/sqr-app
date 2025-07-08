import { cn } from "@/shared/lib/css/tailwind";
import { AdaptiveDrawer } from "@/shared/ui/adaptive-drawer";
import { Button } from "@/shared/ui/kit/button";
import { useState } from "react";
import { type Contact } from "../model/contacts";
import { ContactCard } from "../ui/contact-card";
import { ContactsSearchInput } from "../ui/contacts-search-input";

interface ContactsSearchProps {
  contacts: Contact[];
  className?: string;
  onContactClick?: (contact: Contact) => void;
}

export function ContactsSearch({
  contacts,
  className,
  onContactClick,
}: ContactsSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const handleContactClick = (contact: Contact) => {
    onContactClick?.(contact);
    setIsOpen(false);
  };

  return (
    <>
      {/* Search Button */}
      <Button
        className={cn(
          "w-full py-4 bg-background text-foreground justify-center",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        Select from contacts
      </Button>

      {/* Contacts Drawer */}
      <AdaptiveDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Select a contact"
        className="h-[80vh]"
        drawerHeaderContent={
          <ContactsSearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
          />
        }
      >
        <div className="relative mt-6">
          {/* Contacts List */}
          <div className="flex flex-col gap-2 pb-22">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={() => handleContactClick(contact)}
              />
            ))}
            {filteredContacts.length === 0 && (
              <p className="text-muted-foreground text-center">
                No contacts found
              </p>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="secondary"
            className="w-[calc(100%-40px)] fixed bottom-5 py-4.5"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </AdaptiveDrawer>
    </>
  );
}
