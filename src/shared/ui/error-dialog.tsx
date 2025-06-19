"use client";

import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { CloudOff } from "lucide-react";

interface ChatConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErrorDialog({
  title,
  description,
  open,
  onOpenChange,
}: ChatConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[350px] border-none rounded-3xl bg-primary place-items-center gap-0"
      >
        <DialogTitle className="text-2xl">
          <CloudOff className="w-10 h-10" />
        </DialogTitle>
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl">{title}</p>
          <p className="text-lg text-primary-foreground">{description}</p>
        </div>
        <Button className="min-w-35 mt-5" onClick={() => onOpenChange(false)}>
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}
