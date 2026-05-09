import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border px-5 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*6)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-4 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 transition-all duration-200 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-900 border-slate-200",
        destructive:
          "border-red-500/20 bg-red-500/5 text-red-600 [&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-600/80",
        success:
          "border-primary/20 bg-primary/5 text-primary [&>svg]:text-primary *:data-[slot=alert-description]:text-primary/80",
        info:
          "border-blue-500/20 bg-blue-500/5 text-blue-600 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-600/80",
        warning:
          "border-amber-500/20 bg-amber-500/5 text-amber-600 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-600/80",
        sweet:
          "flex flex-col items-center text-center p-8 bg-white border-none shadow-2xl rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-base tracking-tight leading-none",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-sm leading-relaxed mt-1",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
