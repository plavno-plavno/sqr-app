import type { PropsWithChildren } from "react";
import { languageOptions } from "@/shared/mock/languages";
import { promptOptions } from "@/shared/mock/prompt";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

interface MainLayoutProps {
  language: string;
  prompt: string;
  onLanguageChange: (lang: string) => void;
  onPromptChange: (prompt: string) => void;
}

export const MainLayout = ({
  children,
  language,
  prompt,
  onLanguageChange,
  onPromptChange,
}: PropsWithChildren<MainLayoutProps>) => {
  const languageLabel = languageOptions.find(option => option.value === language)?.label;
  const promptLabel = promptOptions.find(option => option.value === prompt)?.label;

  return (
    <main className="flex flex-col h-screen w-full bg-black">
      <div className="px-10 py-5 flex justify-end items-center">
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Select defaultValue={languageLabel} onValueChange={onLanguageChange}>
            <SelectTrigger className="border-white [&_svg]:!text-white [&_svg]:!opacity-100">
              <SelectValue>{languageLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue={promptLabel} onValueChange={onPromptChange}>
            <SelectTrigger className="border-white [&_svg]:!text-white [&_svg]:!opacity-100">
              <SelectValue>{promptLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {promptOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* <Select
            value={language}
            onValueChange={onLanguageChange}
            options={languageOptions}
            className="[&>div]:!bg-black [&>div]:!text-white [&>div>span>span]:!text-white [&>span]:!text-white"
            style={{ width: 120 }}
            styles={{
              popup: {
                root: {
                  background: "#000000",
                  color: "#ffffff",
                  border: "1px solid #ffffff",
                },
              },
            }}
          />
          <Select
            value={prompt}
            onChange={onPromptChange}
            options={promptOptions}
            className="[&>div]:!bg-black [&>div]:!text-white [&>div>span>span]:!text-white [&>span]:!text-white"
            style={{ width: 120 }}
            styles={{
              popup: {
                root: {
                  background: "#000000",
                  color: "#ffffff",
                  border: "1px solid #ffffff",
                },
              },
            }}
          /> */}
        </div>
      </div>
      <div className="flex-1 h-full overflow-auto">{children}</div>
      <div />
    </main>
  );
};
