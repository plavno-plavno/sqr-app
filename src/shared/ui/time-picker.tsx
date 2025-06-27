import { cn } from "../lib/css/tailwind";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./kit/select";

interface TimePickerProps {
  value?: string; // Format: "HH:mm" (24-hour)
  onChange: (time: string) => void; // Returns "HH:mm" (24-hour)
  className?: string;
  placeholder?: string;
}

export const TimePicker = ({ 
  value, 
  onChange, 
  className,
}: TimePickerProps) => {
  // Convert 24-hour to 12-hour format
  const parseTime = (time24: string) => {
    if (!time24) return { hours: "", minutes: "", period: "AM" };
    
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    
    return {
      hours: hour12.toString().padStart(2, '0'),
      minutes,
      period
    };
  };

  // Convert 12-hour to 24-hour format
  const formatTime = (hours: string, minutes: string, period: string) => {
    if (!hours || !minutes) return "";
    
    let hour24 = parseInt(hours);
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`;
  };

  const { hours, minutes, period } = parseTime(value || "");

  const handleHourChange = (newHours: string) => {
    if (minutes && period) {
      onChange(formatTime(newHours, minutes, period));
    }
  };

  const handleMinuteChange = (newMinutes: string) => {
    if (hours && period) {
      onChange(formatTime(hours, newMinutes, period));
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (hours && minutes) {
      onChange(formatTime(hours, minutes, newPeriod));
    }
  };

  // Generate hour options (01-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, '0');
  });

  // Generate minute options (00, 05, 10, 15, ...)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    return minute.toString().padStart(2, '0');
  });

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <Select value={hours} onValueChange={handleHourChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map(hour => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="text-muted-foreground">:</span>
      
      <Select value={minutes} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map(minute => (
            <SelectItem key={minute} value={minute}>
              {minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}; 