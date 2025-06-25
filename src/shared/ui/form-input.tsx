import { cn } from "@/shared/lib/css/tailwind";
import { Input, type InputProps } from "./kit/input";

export function FormInput({
  rootClasses,
  leftElement,
  rightElement,
  error,
  ...props
}: InputProps & {
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  rootClasses?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", rootClasses)}>
      <div className="flex items-center gap-1">
        {leftElement}
        <Input {...props} />
        {rightElement}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
