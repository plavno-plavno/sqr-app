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
  PaymentMethod,
  paymentOptionsMock,
  type PaymentOption,
} from "@/features/finance";
import { cn } from "@/shared/lib/css/tailwind";
import type { InvestmentOutput } from "@/shared/model/intents";
import { FormInput } from "@/shared/ui/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

export type InvestConfirmData = Partial<
  InvestmentOutput["investment_details"]
> & {
  payment: PaymentOption;
};

interface ChatInvestDialogProps {
  data: Partial<InvestmentOutput>;
  open: boolean;
  onConfirm: (data: InvestConfirmData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  shares_to_purchase: z.coerce
    .number({
      required_error: "Amount is required",
    })
    .min(0, "Minimum amount is 0"),
  payment: z.object({
    identifier: z.string().min(1, "Payment method is required"),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatInvestDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatInvestDialogProps) {
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shares_to_purchase: data?.investment_details?.shares_to_purchase || 0,
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const shares_to_purchase = watch("shares_to_purchase");
  const totalCost = shares_to_purchase
    ? Math.round(+shares_to_purchase * +(data?.market_info?.current_price || 0))
    : 0;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const res = formSchema.safeParse(data);

    if (!res.success) return;

    onConfirm({
      ...data,
      investment_amount: totalCost,
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
        <ChatDialogActionCardSection title="Buy">
          <ChatDialogActionCardRowWithIcon
            className={cn(
              errors.shares_to_purchase?.message
                ? "items-start"
                : "items-center"
            )}
            firstLine={
              <FormInput
                autoFocus
                className="text-2xl font-semibold p-0 min-w-5 max-w-40"
                variant="ghost"
                style={{
                  width: `${shares_to_purchase?.toString().length || 1}ch`,
                }}
                type="number"
                step="any"
                error={errors.shares_to_purchase?.message}
                rightElement={
                  <p className="text-2xl font-semibold">
                    {data?.investment_details?.stock_symbol || ""}
                  </p>
                }
                {...register("shares_to_purchase")}
              />
            }
            secondLine={
              <p className="text-sm text-muted-foreground">
                Purchase price: {data?.market_info?.current_price || 0}{" "}
                {data?.investment_details?.currency || "USD"}
              </p>
            }
          />
        </ChatDialogActionCardSection>
        <ChatDialogActionCardSection title="Amount">
          <ChatDialogActionCardRowTwoItems
            leftValue={totalCost}
            rightValue={data?.investment_details?.current_price || 0}
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
