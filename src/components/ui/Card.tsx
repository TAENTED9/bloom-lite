import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
}

const PADDING: Record<Padding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-card-border bg-card shadow-xl shadow-black/20",
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
