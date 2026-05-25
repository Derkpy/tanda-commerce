import type { PropsWithChildren } from "react";

export function Alert({ children }: PropsWithChildren) {
  return (
    <div
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      role="alert"
    >
      {children}
    </div>
  );
}
