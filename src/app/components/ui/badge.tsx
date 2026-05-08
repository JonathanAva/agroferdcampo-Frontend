import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 transition-all shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-text)]/20 hover:brightness-95",
        secondary:
          "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
        destructive:
          "bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-text)]/20 hover:brightness-95",
        outline:
          "text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--accent-subtle)]",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-text)]/20 hover:brightness-95",
        info:
          "bg-[rgba(59,130,246,0.1)] text-[#1d4ed8] border-blue-200/30",
        accent:
          "bg-[var(--accent)] text-white border-[var(--accent)] hover:opacity-90 shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
