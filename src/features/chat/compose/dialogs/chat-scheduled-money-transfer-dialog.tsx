import type { ScheduledTransferOutput } from "@/shared/model/intents";
import {
  ChatDialogActionCard,
  ChatDialogActionCardAmount,
  ChatDialogActionCardRecipient,
  ChatDialogPaymentCard
} from "../..";
import { ChatConfirmDialog } from "../../ui/chat-confirm-dialog";

interface ChatScheduledMoneyTransferDialogProps {
  data: ScheduledTransferOutput;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChatScheduledMoneyTransferDialog({
  data,
  open,
  onConfirm,
  onCancel,
}: ChatScheduledMoneyTransferDialogProps) {
  return (
      <ChatConfirmDialog
        open={open}
        title={"Sure, just confirm"}
        actionButtonText="Confirm"
        onConfirm={onConfirm}
        onCancel={onCancel}
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
