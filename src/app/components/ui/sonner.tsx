"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-primary/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:font-bold",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
          success: "group-[.toast]:border-primary group-[.toast]:bg-primary/5",
          error: "group-[.toast]:border-destructive group-[.toast]:bg-destructive/5",
          info: "group-[.toast]:border-blue-500 group-[.toast]:bg-blue-500/5",
          warning: "group-[.toast]:border-orange-500 group-[.toast]:bg-orange-500/5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
