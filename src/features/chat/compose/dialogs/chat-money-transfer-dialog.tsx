import type { TransferMoneyOutput } from "@/shared/model/intents";
import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardRecipient,
  ChatDialogPaymentCard
} from "../..";

interface ChatBuyBtcDialogProps {
  data: TransferMoneyOutput;
  open: boolean;
  onActionButtonClick: () => void;
  onCancelButtonClick: () => void;
}

export function ChatMoneyTransferDialog({
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
        <ChatDialogActionCardRecipient
          name={data.transfer_details.recipient}
        />
        <ChatDialogActionCardAmount
          amount={data.transfer_details.amount}
          restAmount={data.transfer_details.amount}
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
