import { useIsMobile } from "../lib/react/use-mobile";
import { ScrollArea } from "./kit/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./kit/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./kit/dialog";

interface AdaptiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

export function AdaptiveDrawer({
  open,
  onOpenChange,
  title,
  children,
}: AdaptiveDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          overlayVariant="dark"
          className="bg-white px-5 grid grid-rows-[auto_1fr]"
          showDragTip={false}
        >
          <DrawerHeader className="p-0 pt-7.5">
            <DrawerTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
              {title}
            </DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-min-0 pr-3.5 -mr-3.5 overflow-hidden">
            {children}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayVariant="dark"
        className="sm:max-w-[425px] bg-white gap-0"
      >
        <DialogHeader>
          <DialogTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
            Transaction details
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-min-0 pr-3.5 -mr-3.5 overflow-hidden">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
