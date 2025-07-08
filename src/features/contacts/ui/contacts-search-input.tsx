import { cn } from "@/shared/lib/css/tailwind";
import SearchIcon from "@/shared/assets/icons/search-icon.svg?react";

export function ContactsSearchInput({
  className,
  ...props
}: React.ComponentProps<"input"> & { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-muted rounded-xl p-4",
        className
      )}
    >
      <SearchIcon />
      <input
        type="text"
        className="w-full bg-transparent text-base placeholder-muted-foreground text-foreground focus:outline-none"
        {...props}
      />
    </div>
  );
}
