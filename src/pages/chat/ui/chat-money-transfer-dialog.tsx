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

export type MoneyTransferConfirmData = Partial<TransferMoneyOutput["transfer_details"]> & {
  payment: PaymentOption;
};

interface ChatMoneyTransferDialogProps {
  data: Partial<TransferMoneyOutput>;
  open: boolean;
  onConfirm: (data: MoneyTransferConfirmData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
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

export function ChatMoneyTransferDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatMoneyTransferDialogProps) {
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
                className="text-2xl font-semibold p-0"
                variant="ghost"
                error={errors.recipient?.message}
                {...register("recipient")}
              />
            }
          />
        </ChatDialogActionCardSection>
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
            rightValue={data?.transfer_details?.amount || 0}
          />
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
