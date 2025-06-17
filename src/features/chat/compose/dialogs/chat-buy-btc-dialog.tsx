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
  onCancelButtonClick: () => void;
}

export function ChatBuyBtcDialog({
  data,
  open,
  onActionButtonClick,
  onCancelButtonClick,
}: ChatBuyBtcDialogProps) {
  return (
    <ChatConfirmDialog
      title={"Sure, just confirm"}
      actionButtonText="OK"
      onActionButtonClick={onActionButtonClick}
      onCancelButtonClick={onCancelButtonClick}
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
        title="Pay using"
        identifier="**** 7890"
        paymentMethod="Credit card"
      />
    </ChatConfirmDialog>
  );
}
