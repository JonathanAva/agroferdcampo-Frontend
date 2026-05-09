import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 transition-all shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
        outline:
          "text-foreground border-border hover:bg-accent/10",
        success:
          "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        warning:
          "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
        info:
          "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "px-2 py-0 text-[9px]",
        lg: "px-3 py-1 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
