import type { ScheduledTransferOutput } from "@/shared/model/intents";
import {
  ChatConfirmDialog,
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardRecipient,
  ChatDialogPaymentCard
} from "../..";

interface ChatScheduledMoneyTransferDialogProps {
  data: ScheduledTransferOutput;
  open: boolean;
  onActionButtonClick: () => void;
  onCancelButtonClick: () => void;
}

export function ChatScheduledMoneyTransferDialog({
  data,
  open,
  onActionButtonClick,
  onCancelButtonClick,
}: ChatScheduledMoneyTransferDialogProps) {
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
          date={new Date(data.transfer_details.scheduled_time)}
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
