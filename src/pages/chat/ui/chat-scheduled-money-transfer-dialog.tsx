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
import { useTranslation } from "react-i18next";
import {
  ChatDialogActionCard,
  ChatDialogActionCardRowTwoItems,
  ChatDialogActionCardRowWithIcon,
  ChatDialogActionCardSection,
  ChatDialogPaymentCard,
  PaymentSelect,
} from "@/features/chat";
import { ChatConfirmDialog } from "@/features/chat";
import type i18next from "i18next";

export type ScheduledTransferConfirmData = Partial<
  ScheduledTransferOutput["transfer_details"]
> & {
  payment: PaymentOption;
};

interface ChatScheduledMoneyTransferDialogProps {
  data: Partial<ScheduledTransferOutput>;
  open: boolean;
  onConfirm: (data: ScheduledTransferConfirmData) => void;
  onCancel: () => void;
}

const createFormSchema = (t: typeof i18next.t) => z.object({
  recipient: z.string().min(1, t('dialog.validation.recipientRequired')),
  scheduled_day: z.coerce
    .date({
      required_error: t('dialog.validation.dateRequired'),
    })
    .min(new Date(), t('dialog.validation.dateMustBeFuture')),
  scheduled_hour: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, t('dialog.validation.invalidTimeFormat'))
    .min(1, t('dialog.validation.timeRequired')),
  amount: z.coerce
    .number({
      required_error: t('dialog.validation.amountRequired'),
    })
    .min(1, t('dialog.validation.minimumAmount', { amount: 1 })),
  payment: z.object({
    identifier: z.string().min(1, t('dialog.validation.paymentMethodRequired')),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function ChatScheduledMoneyTransferDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatScheduledMoneyTransferDialogProps) {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Number(data?.transfer_details?.amount || 0),
      recipient: data?.transfer_details?.recipient || "",
      scheduled_day: new Date(data?.transfer_details?.scheduled_time || new Date()),
      scheduled_hour: new Date(data?.transfer_details?.scheduled_time || new Date())
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
      title={t('dialog.sureJustConfirm')}
      actionButtonText={t('dialog.confirm')}
      onCancel={onCancel}
      contentLayout={({ children, className }) => (
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      )}
    >
      <ChatDialogActionCard>
        <ChatDialogActionCardSection title={t('chat.recipient')}>
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
          <ChatDialogActionCardSection title={t('dialog.amount')}>
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
              rightValue={data?.transfer_details?.amount || 0}
            />
          </ChatDialogActionCardSection>
        </ChatDialogActionCardSection>
      </ChatDialogActionCard>
      <ChatDialogPaymentCard title={t('dialog.payUsing')}>
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
