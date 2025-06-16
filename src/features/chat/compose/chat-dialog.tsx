import { IntentType } from "@/shared/model/intents";
import { useChatStore } from "../model/chat-store";
import { ChatBuyBtcDialog } from "./dialogs/chat-buy-btc-dialog";
import { ChatMoneyTransferDialog } from "./dialogs/chat-money-transfer-dialog";

export function ChatDialog() {
  const dialog = useChatStore.use.dialog();
  const setDialog = useChatStore.use.setDialog();

  const { dialogIntent, open } = dialog;

  if (dialogIntent?.intent === IntentType.BUY_BTC) {
    return (
      <ChatBuyBtcDialog
        data={dialogIntent.output}
        open={open}
        onActionButtonClick={() => setDialog(false, null)}
      />
    );
  }

  if (dialogIntent?.intent === IntentType.TRANSFER_MONEY) {
    return (
      <ChatMoneyTransferDialog
        data={dialogIntent.output}
        open={open}
        onActionButtonClick={() => setDialog(false, null)}
      />
    );
  }

  return null;
}
