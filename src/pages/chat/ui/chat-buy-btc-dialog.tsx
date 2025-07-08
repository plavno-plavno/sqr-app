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
import type { BuyBTCOutput } from "@/shared/model/intents";
import { FormInput } from "@/shared/ui/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

type ConfirmData = Partial<BuyBTCOutput["purchase_details"]> & {
  payment: PaymentOption;
};

interface ChatBuyBtcDialogProps {
  data: BuyBTCOutput;
  open: boolean;
  onConfirm: (data: ConfirmData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  btc_amount: z.coerce
    .number({
      required_error: "Amount is required",
    })
    .min(0.1, "Minimum amount is 0.1 BTC")
    .max(1, "Maximum amount is 1 BTC"),
  payment: z.object({
    identifier: z.string().min(1, "Payment method is required"),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatBuyBtcDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatBuyBtcDialogProps) {
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      btc_amount: data.purchase_details.btc_amount || 0,
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const btc_amount = watch("btc_amount");
  const totalCost = btc_amount
    ? Math.round(+btc_amount * +data.market_info.btc_price)
    : 0;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const res = formSchema.safeParse(data);

    if (!res.success) return;

    onConfirm({
      ...data,
      total_cost: totalCost,
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
              errors.btc_amount?.message ? "items-start" : "items-center"
            )}
            firstLine={
              <FormInput
                autoFocus
                className="text-2xl font-semibold p-0 min-w-5 max-w-40"
                variant="ghost"
                style={{
                  width: `${btc_amount?.toString().length || 1}ch`,
                }}
                type="number"
                step="any"
                error={errors.btc_amount?.message}
                rightElement={<p className="text-2xl font-semibold">BTC</p>}
                {...register("btc_amount")}
              />
            }
          />
        </ChatDialogActionCardSection>
        <ChatDialogActionCardSection title="Amount">
          <ChatDialogActionCardRowTwoItems
            leftValue={totalCost}
            rightValue={data.purchase_details.current_price}
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
