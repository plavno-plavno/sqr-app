import { cn } from "@/shared/lib/css/tailwind";
import { AdaptiveDrawer } from "@/shared/ui/adaptive-drawer";
import { Button } from "@/shared/ui/kit/button";
import { SearchInput } from "@/shared/ui/search-input";
import { useMemo, useState } from "react";
import { useLanguageStore } from "../model/language-store";
import { type LanguageOption } from "../model/language";
import { LanguageCard } from "../ui/language-card";

interface LanguageSearchProps {
  disabled?: boolean;
  className?: string;
  onLanguageSelect?: (language: LanguageOption) => void;
  trigger?: React.ReactNode;
}

export function LanguageSearch({
  disabled,
  className,
  onLanguageSelect,
  trigger,
}: LanguageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    allLanguages,
    language: currentLanguage,
    setLanguage,
  } = useLanguageStore();

  // Move selected language to the beginning
  const sortedLanguages = useMemo(() => [
    ...allLanguages.filter((lang) => lang.code === currentLanguage.code),
    ...allLanguages.filter((lang) => lang.code !== currentLanguage.code),
  ], [allLanguages, currentLanguage]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => sortedLanguages.filter(
    (language) =>
      language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.code.toLowerCase().includes(searchQuery.toLowerCase())
  ), [sortedLanguages, searchQuery]);

  const handleLanguageClick = (language: LanguageOption) => {
    setLanguage(language);
    onLanguageSelect?.(language);
    setIsOpen(false);
  };

  return (
    <>
      {/* Language Selection Trigger */}
      <div
        className={cn(className)}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {trigger}
      </div>

      {/* Language Selection Drawer */}
      <AdaptiveDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Select a language"
        className="h-[80vh]"
        drawerHeaderContent={
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search languages..."
          />
        }
      >
        <div className="relative mt-6">
          {/* Languages List */}
          <div className="flex flex-col gap-2 pb-22">
            {filteredLanguages.map((language) => (
              <LanguageCard
                key={language.code}
                language={language}
                disabled={disabled}
                isSelected={language.code === currentLanguage.code}
                onClick={() => handleLanguageClick(language)}
              />
            ))}
            {filteredLanguages.length === 0 && (
              <p className="text-muted-foreground text-center">
                No languages found
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
