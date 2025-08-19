import type { TransferMoneyOutput } from "@/shared/model/intents";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/shared/ui/form-input";
import { cn } from "@/shared/lib/css/tailwind";
import {
  PaymentMethod,
  paymentOptionsMock,
  type PaymentOption,
} from "@/features/finance";
import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardRowTwoItems,
  ChatDialogActionCardRowWithIcon,
  ChatDialogActionCardSection,
  ChatDialogPaymentCard,
  PaymentSelect,
} from "@/features/chat";
import {
  contactsMock,
} from "@/features/contacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/kit/select";
import { useTranslation } from "react-i18next";
import type i18next from "i18next";
import { useState } from "react";

export type MoneyTransferConfirmData = Partial<TransferMoneyOutput["transfer_details"]> & {
  payment: PaymentOption;
};

interface ChatMoneyTransferDialogProps {
  data: Partial<TransferMoneyOutput>;
  open: boolean;
  onConfirm: (data: MoneyTransferConfirmData) => void;
  onCancel: () => void;
}

const createFormSchema = (t: typeof i18next.t) => z.object({
  recipient: z.string().min(1, t('dialog.validation.recipientRequired')),
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

export function ChatMoneyTransferDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatMoneyTransferDialogProps) {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  const [currentPhone, setCurrentPhone] = useState(data?.notifications?.recipient_phone || "");
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: Number(data?.transfer_details?.amount || 0),
      recipient: data?.transfer_details?.recipient || "",
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    const res = formSchema.safeParse(formData);

    if (!res.success) return;

    onConfirm(formData);
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contactsMock.find(c => c.id === contactId);
    if (contact) {
      setValue("recipient", contact.name);
      setCurrentPhone(contact.phone);
    }
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
              <div className="flex flex-col gap-1">
                <FormInput
                  className="text-2xl font-semibold p-0"
                  variant="ghost"
                  error={errors.recipient?.message}
                  {...register("recipient")}
                />
                {(data?.notifications?.recipient_phone || currentPhone) && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground/50 font-medium">
                      {currentPhone}
                    </p>
                    <Select onValueChange={handleContactSelect}>
                      <SelectTrigger size="sm" className="h-7 w-10 px-2 text-sm [&>svg]:hidden">
                        <span className="text-xs">📞</span>
                      </SelectTrigger>
                      <SelectContent>
                        {contactsMock.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-xs text-muted-foreground">{contact.phone}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            }
          />
        </ChatDialogActionCardSection>
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
