import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardRowTwoItems,
  ChatDialogActionCardSection,
  ChatDialogPaymentCard,
  PaymentSelect
} from "@/features/chat";
import {
  PaymentMethod,
  paymentOptionsMock,
  type PaymentOption,
} from "@/features/finance";
import { FormInput } from "@/shared/ui/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

export type TransferWithDetailsConfirmData = {} & {
  payment: PaymentOption;
};

interface ChatTransferWithDetailsDialogProps {
  open: boolean;
  onConfirm: (data: TransferWithDetailsConfirmData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  details: z.string().min(1, "Details are required"),
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

export function ChatTransferWithDetailsDialog({
  open,
  onConfirm,
  onCancel,
}: ChatTransferWithDetailsDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: "",
      amount: 0,
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const res = formSchema.safeParse(data);

    if (!res.success) return;

    onConfirm(data);
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
        <ChatDialogActionCardSection title="Transfer Details" className="flex flex-col gap-2">
          <FormInput
            variant="ghost"
            type="text"
            className="text-2xl font-semibold truncate p-0"
            error={errors.details?.message}
            {...register("details")}
          />
        </ChatDialogActionCardSection>
        <ChatDialogActionCardSection title="Amount">
          <ChatDialogActionCardRowTwoItems
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
            rightValue={500}
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
