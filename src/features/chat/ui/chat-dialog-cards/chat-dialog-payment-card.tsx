import ImageFallbackIcon from "@/shared/assets/icons/image-fallback-icon.svg?react";
import { cn } from "@/shared/lib/css/tailwind";
import { IconWrapper } from "@/shared/ui/icon-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/kit/select";
import { SelectGroup } from "@radix-ui/react-select";
import { ChatDialogCardLayout } from "./chat-dialog-card-layout";
import { PaymentMethod, type PaymentOption } from "@/features/finance";
import { memo } from "react";

export function PaymentSelectItem({
  identifier,
  paymentMethod,
}: PaymentOption) {
  const value =
    paymentMethod === PaymentMethod.CreditCard
      ? `**** ${identifier.slice(-4)}`
      : `${identifier.slice(0, 4)}...${identifier.slice(-4)}`;

  return (
    <div className="flex justify-between items-center gap-2 w-full">
      <p className="text-sm font-semibold truncate">{value}</p>
      <div className="flex items-center gap-1 p-1 pl-3 bg-primary rounded-full">
        <p className="text-sm font-semibold">{paymentMethod}</p>
        <IconWrapper className="w-4 h-4 bg-icon-wrapper-secondary">
          <ImageFallbackIcon className="w-1.5! h-1.5!" />
        </IconWrapper>
      </div>
    </div>
  );
}

export const PaymentSelect = memo(
  ({
    options,
    value,
    onValueChange,
    className,
  }: {
    options: PaymentOption[];
    value: PaymentOption;
    onValueChange: (value: PaymentOption) => void;
    className: string;
  }) => {
    const handleValueChange = (identifier: string) => {
      const selectedOption = options.find(
        (option) => option.identifier === identifier
      );
      if (selectedOption) {
        onValueChange(selectedOption);
      }
    };

    return (
      <Select value={value.identifier} onValueChange={handleValueChange}>
        <SelectTrigger className={cn("h-auto p-3", className)}>
          <PaymentSelectItem
            identifier={value.identifier}
            paymentMethod={value.paymentMethod}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.identifier}
                value={option.identifier}
                className="focus:bg-primary-light grid"
              >
                <PaymentSelectItem
                  identifier={option.identifier}
                  paymentMethod={option.paymentMethod}
                />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
);

export function ChatDialogPaymentCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <ChatDialogCardLayout className={cn(className)}>
      <p className="text-sm font-medium text-primary-foreground">{title}</p>

      {children}
    </ChatDialogCardLayout>
  );
}
