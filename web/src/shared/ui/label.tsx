import type { LabelHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-neutral-800", className)}
      {...props}
    />
  );
}
