import { cn } from "@/lib/utils";

export type BadgeStatus = "pending" | "completed" | "failed" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
}

const STATUS_STYLES: Record<BadgeStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  completed: "bg-success/15 text-success ring-success/30",
  failed: "bg-error/15 text-error ring-error/30",
  neutral: "bg-surface text-text-muted ring-card-border",
};

const STATUS_LABELS: Record<BadgeStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  neutral: "—",
};

export function Badge({
  status = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status],
        className
      )}
      {...props}
    >
      {children ?? STATUS_LABELS[status]}
    </span>
  );
}
