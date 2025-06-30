import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

interface ChatConfirmDialogProps {
  open: boolean;
  title: string;
  actionButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  contentLayout?: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
}

export function ChatConfirmDialog({
  open,
  title,
  actionButtonText = "Send",
  onConfirm,
  onCancel,
  children,
  contentLayout: ContentLayout,
}: ChatConfirmDialogProps) {
  const DefaultWrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  const Wrapper = ContentLayout || DefaultWrapper;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        overlayVariant="light"
        className="sm:max-w-[425px] border-none rounded-3xl bg-primary"
      >
        <Wrapper className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">{children}</div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              onClick={onConfirm}
            >
              {actionButtonText}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </Wrapper>
      </DialogContent>
    </Dialog>
  );
}
