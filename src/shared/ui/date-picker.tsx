import { ChevronDownIcon } from "lucide-react";
import { cn } from "../lib/css/tailwind";
import { formatDateToMonthDay } from "../lib/js/date-utils";
import { Button } from "./kit/button";
import { Calendar } from "./kit/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./kit/popover";
import type { DayPicker } from "react-day-picker";

type DatePickerProps = Omit<
  React.ComponentProps<typeof DayPicker>,
  "selected" | "mode" | "onDayClick" | "onSelect"
> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (day: Date) => void;
  value: Date;
  variant?: "outline" | "ghost";
  className?: string;
};

export const DatePicker = ({
  open,
  setOpen,
  onChange,
  value,
  variant = "outline",
  className,
  ...props
}: DatePickerProps) => {
  const renderTrigger = () => {
    switch (variant) {
      case "outline":
        return (
          <Button
            variant={variant}
            className={cn("justify-between font-normal", className)}
          >
            {formatDateToMonthDay(value)}
            <ChevronDownIcon />
          </Button>
        );
      case "ghost":
        return (
          <p className={cn("cursor-pointer", className)}>
            {formatDateToMonthDay(value)}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onDayClick={(day) => {
            onChange(day);
            setOpen(false);
          }}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
};
