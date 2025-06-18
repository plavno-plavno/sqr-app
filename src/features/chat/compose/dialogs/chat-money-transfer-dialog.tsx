import type { TransferMoneyOutput } from "@/shared/model/intents";
import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardRecipient,
  ChatDialogPaymentCard
} from "../..";

interface ChatMoneyTransferDialogProps {
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
}: ChatMoneyTransferDialogProps) {
  return (
    <ChatConfirmDialog
      title={"Sure, just confirm"}
      actionButtonText="Confirm"
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
