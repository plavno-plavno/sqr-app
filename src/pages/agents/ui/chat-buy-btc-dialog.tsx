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
import { useTranslation } from "react-i18next";
import type i18next from "i18next";

export type BuyBtcConfirmData = Partial<BuyBTCOutput["purchase_details"]> & {
  payment: PaymentOption;
};

interface ChatBuyBtcDialogProps {
  data: Partial<BuyBTCOutput>;
  open: boolean;
  onConfirm: (data: BuyBtcConfirmData) => void;
  onCancel: () => void;
}

const createFormSchema = (t: typeof i18next.t) => z.object({
  btc_amount: z.coerce
    .number({
      required_error: t('dialog.validation.amountRequired'),
    })
    .min(0, t('dialog.validation.minimumBtc'))
    .max(1, t('dialog.validation.maximumBtc')),
  payment: z.object({
    identifier: z.string().min(1, t('dialog.validation.paymentMethodRequired')),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function ChatBuyBtcDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatBuyBtcDialogProps) {
  const { t } = useTranslation();
  const formSchema = createFormSchema(t);
  
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      btc_amount: data?.purchase_details?.btc_amount || 0,
      payment: {
        identifier: paymentOptionsMock[0].identifier,
        paymentMethod: paymentOptionsMock[0].paymentMethod,
      },
    },
  });

  const btc_amount = watch("btc_amount");
  const totalCost = btc_amount
    ? Math.round(+btc_amount * +(data?.market_info?.btc_price || 0))
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
        <ChatDialogActionCardSection title={t('dialog.buy')}>
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
        <ChatDialogActionCardSection title={t('dialog.amount')}>
          <ChatDialogActionCardRowTwoItems
            leftValue={totalCost}
            rightValue={data?.purchase_details?.current_price || 0}
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
