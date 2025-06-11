"use client";

import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";

interface ChatConfirmDialogProps {
  title: string;
  open: boolean;
  actionButtonText?: string;
  onActionButtonClick?: () => void;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ChatConfirmDialog({
  title,
  open,
  actionButtonText = "Send",
  onActionButtonClick,
  onOpenChange,
  children,
}: ChatConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayVariant="light"
        className="sm:max-w-[425px] border-none rounded-3xl gap-6 bg-primary"
      >
        <DialogHeader>
          <DialogTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">{children}</div>
        <div className="flex gap-2">
          <Button size="lg" className="flex-1" onClick={onActionButtonClick}>
            {actionButtonText}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
