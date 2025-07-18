import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css/tailwind";
import ImageFallbackIcon from "@/shared/assets/icons/image-fallback-icon.svg?react";

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
  ...props
}: VariantProps<typeof iconWrapperVariants> & {
  children?: React.ReactNode;
  className?: string;
} & React.ComponentProps<"div">) {
  return (
    <div className={cn(iconWrapperVariants({ radius }), className)} {...props}>
      {children || <ImageFallbackIcon />}
    </div>
  );
}

export { IconWrapper, iconWrapperVariants };
