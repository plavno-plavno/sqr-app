import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css/tailwind";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        sm: "h-8 px-2 py-1 text-sm file:h-6 file:text-xs",
        default: "h-9 px-3 py-1 text-base file:h-7 file:text-sm md:text-sm",
        lg: "h-10 px-4 py-2 text-base file:h-8 file:text-sm",
        xl: "h-12 px-4 py-3 text-lg file:h-9 file:text-base",
      },
      variant: {
        default:
          "border border-input shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        ghost: "border-none",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, size, variant, ...props }: InputProps) {
  return (
    <input
      ref={props.ref}
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
