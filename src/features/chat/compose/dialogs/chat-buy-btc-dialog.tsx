import type { BuyBTCOutput } from "@/shared/model/intents";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import {
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardBuy,
  ChatDialogPaymentCard,
} from "../..";
import { ChatConfirmDialog } from "../../ui/chat-confirm-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ChatBuyBtcDialogProps {
  data: BuyBTCOutput;
  open: boolean;
  onConfirm: (data: Partial<BuyBTCOutput["purchase_details"]>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  btc_amount: z.coerce
    .number({
      required_error: "Amount is required",
    })
    .min(0.1, "Minimum amount is 0.1 BTC")
    .max(1, "Maximum amount is 1 BTC"),
});

type FormValues = z.infer<typeof formSchema>;

export function ChatBuyBtcDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatBuyBtcDialogProps) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      btc_amount: data.purchase_details.btc_amount,
    },
  });
  const { watch } = methods;

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
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
            {children}
          </form>
        </FormProvider>
      )}
    >
      <ChatDialogActionCard>
        <ChatDialogActionCardBuy amount={btc_amount || 0} coin="BTC" />
        <ChatDialogActionCardAmount
          amount={totalCost}
          restAmount={data.purchase_details.current_price}
        />
      </ChatDialogActionCard>
      <ChatDialogPaymentCard
        title="Pay using"
        identifier="**** 7890"
        paymentMethod="Credit card"
      />
    </ChatConfirmDialog>
  );
}
