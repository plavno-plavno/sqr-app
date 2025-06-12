import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css/tailwind";
import { ImageFallbackIcon } from "./icons/ImageFallbackIcon";

const iconWrapperVariants = cva(
  "grid place-items-center w-8 h-8 rounded-full bg-primary",
  {
    variants: {
      radius: {
        base: "rounded-lg",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      radius: "rounded",
    },
  }
);

function IconWrapper({
  children,
  radius = "rounded",
  className,
}: VariantProps<typeof iconWrapperVariants> & {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(iconWrapperVariants({ radius }), className)}>
      {children || <ImageFallbackIcon />}
    </div>
  );
}

export { IconWrapper, iconWrapperVariants };
