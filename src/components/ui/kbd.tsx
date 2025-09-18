import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm",
  {
    variants: {
      size: {
        sm: "h-5 min-w-[20px] text-xs",
        md: "h-6 min-w-[24px] text-sm",
        lg: "h-7 min-w-[28px] text-sm",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <kbd
        className={cn(kbdVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Kbd.displayName = "Kbd"

export { Kbd, kbdVariants }