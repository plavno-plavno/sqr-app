import type { BuyBTCOutput } from "@/shared/model/intents";
import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardBuy,
  ChatDialogPaymentCard,
} from "../..";

interface ChatBuyBtcDialogProps {
  data: BuyBTCOutput;
  open: boolean;
  onActionButtonClick: () => void;
}

export function ChatBuyBtcDialog({
  data,
  open,
  onActionButtonClick,
}: ChatBuyBtcDialogProps) {
  return (
    <ChatConfirmDialog
      title={data.summary.message}
      actionButtonText="OK"
      onActionButtonClick={onActionButtonClick}
      open={open}
    >
      <ChatDialogActionCard>
        <ChatDialogActionCardBuy
          amount={data.purchase_details.btc_amount}
          coin="BTC"
        />
        <ChatDialogActionCardAmount
          amount={data.purchase_details.total_cost}
          restAmount={data.purchase_details.current_price}
        />
      </ChatDialogActionCard>
      <ChatDialogPaymentCard
        title="Wallet address"
        identifier="17rm2dvb439dZqyMe2d4D6AQJSgg6yeNRn"
        paymentMethod="Metamask"
      />
    </ChatConfirmDialog>
  );
}
