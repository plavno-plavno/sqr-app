import { useIsMobile } from "../lib/react/use-mobile";
import { ScrollArea } from "./kit/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./kit/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./kit/dialog";
import { cn } from "../lib/css/tailwind";

interface AdaptiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  drawerHeaderContent?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function AdaptiveDrawer({
  open,
  onOpenChange,
  title,
  drawerHeaderContent,
  className,
  children,
}: AdaptiveDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          overlayVariant="dark"
          className={cn("bg-white px-5 grid grid-rows-[auto_1fr]", className)}
          showDragTip={false}
        >
          <DrawerHeader className="p-0 pt-7.5 flex flex-col gap-4">
            <DrawerTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
              {title}
            </DrawerTitle>
            {drawerHeaderContent}
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
        className={cn("sm:max-w-[425px] bg-white gap-0", className)}
      >
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle className="text-[34px] leading-none font-medium text-details-title-foreground">
            {title}
          </DialogTitle>
          {drawerHeaderContent}
        </DialogHeader>
        <ScrollArea className="h-min-0 pr-3.5 -mr-3.5 overflow-hidden">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
