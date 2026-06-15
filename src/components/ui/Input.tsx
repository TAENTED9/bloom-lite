import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-11 w-full rounded-xl border bg-surface px-4 text-text-primary",
          "placeholder:text-text-muted/60 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand",
          error ? "border-error" : "border-card-border",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
});
