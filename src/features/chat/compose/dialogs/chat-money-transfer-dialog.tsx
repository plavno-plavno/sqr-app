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
}

export function ChatMoneyTransferDialog({
  data,
  open,
  onActionButtonClick,
}: ChatBuyBtcDialogProps) {
  return (
    <ChatConfirmDialog
      title={"Sure, just confirm"}
      actionButtonText="OK"
      onActionButtonClick={onActionButtonClick}
      open={open}
    >
      <ChatDialogActionCard>
        <ChatDialogActionCardRecipient
          name={data.transfer_details.recipient}
          phone={data.transfer_details.recipient}
        />
        <ChatDialogActionCardAmount
          amount={data.transfer_details.amount}
          restAmount={data.transfer_details.amount}
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
