import {
  PaymentMethod,
  paymentOptionsMock,
  type PaymentOption,
} from "@/features/finance";
import { cn } from "@/shared/lib/css/tailwind";
import type { ScheduledTransferOutput } from "@/shared/model/intents";
import { DatePicker } from "@/shared/ui/date-picker";
import { FormInput } from "@/shared/ui/form-input";
import { Input } from "@/shared/ui/kit/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import {
  ChatDialogActionCard,
  ChatDialogActionCardRowTwoItems,
  ChatDialogActionCardRowWithIcon,
  ChatDialogActionCardSection,
  ChatDialogPaymentCard,
  PaymentSelect,
} from "@/features/chat";
import { ChatConfirmDialog } from "@/features/chat";

type ConfirmData = Partial<ScheduledTransferOutput["transfer_details"]> & {
  payment: PaymentOption;
};

interface ChatScheduledMoneyTransferDialogProps {
  data: ScheduledTransferOutput;
  open: boolean;
  onConfirm: (data: ConfirmData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  scheduled_day: z.coerce
    .date({
      required_error: "Date is required",
    })
    .min(new Date(), "Date must be in the future"),
  scheduled_hour: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .min(1, "Time is required"),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
    })
    .min(1, "Minimum amount is 1"),
  payment: z.object({
    identifier: z.string().min(1, "Payment method is required"),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatScheduledMoneyTransferDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatScheduledMoneyTransferDialogProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: data.transfer_details.amount,
      recipient: data.transfer_details.recipient,
      scheduled_day: new Date(data.transfer_details.scheduled_time),
      scheduled_hour: new Date(data.transfer_details.scheduled_time)
        .toISOString()
        .slice(11, 16),
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    const res = formSchema.safeParse(formData);

    if (!res.success) return;

    const { scheduled_day, scheduled_hour, ...rest } = formData;

    const [hours, minutes] = scheduled_hour.split(":");
    const scheduled_time = new Date(scheduled_day);
    scheduled_time.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    onConfirm({
      ...rest,
      scheduled_time: scheduled_time.toISOString(),
    });
  };

  return (
    <ChatConfirmDialog
      open={open}
      title={"Sure, just confirm"}
      actionButtonText="Confirm"
      onCancel={onCancel}
      contentLayout={({ children, className }) => (
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      )}
    >
      <ChatDialogActionCard>
        <ChatDialogActionCardSection title="Recipient">
          <ChatDialogActionCardRowWithIcon
            className={cn(
              errors.recipient?.message ? "items-start" : "items-center"
            )}
            firstLine={
              <FormInput
                tabIndex={1}
                className="text-2xl font-semibold p-0"
                variant="ghost"
                error={errors.recipient?.message}
                {...register("recipient")}
              />
            }
          />
          <ChatDialogActionCardRowWithIcon
            className="items-center"
            firstLine={
              <Controller
                control={control}
                name="scheduled_day"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    open={datePickerOpen}
                    value={value}
                    className="text-2xl font-semibold"
                    variant="ghost"
                    disabled={{ before: new Date() }}
                    setOpen={setDatePickerOpen}
                    onChange={onChange}
                  />
                )}
              />
            }
            secondLine={
              <Input
                variant="ghost"
                type="time"
                className="h-auto p-0 text-lg rounded-none font-medium text-primary-foreground appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register("scheduled_hour")}
              />
            }
          />
          <ChatDialogActionCardSection title="Amount">
            <ChatDialogActionCardRowTwoItems
              className={cn(
                "gap-2",
                errors.amount?.message ? "items-baseline" : "items-end"
              )}
              leftValue={
                <FormInput
                  variant="ghost"
                  type="number"
                  leftElement={
                    <p className="text-[32px] font-semibold text-primary-foreground">
                      $
                    </p>
                  }
                  className="text-[32px] font-semibold truncate p-0"
                  error={errors.amount?.message}
                  {...register("amount")}
                />
              }
              rightValue={data.transfer_details.amount}
            />
          </ChatDialogActionCardSection>
        </ChatDialogActionCardSection>
      </ChatDialogActionCard>
      <ChatDialogPaymentCard title="Pay using">
        <Controller
          control={control}
          name="payment"
          render={({ field: { onChange, value } }) => (
            <PaymentSelect
              options={paymentOptionsMock}
              className="w-full"
              value={value}
              onValueChange={onChange}
            />
          )}
        />
      </ChatDialogPaymentCard>
    </ChatConfirmDialog>
  );
}
