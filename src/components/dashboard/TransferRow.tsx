import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatFiat } from "@/lib/fx";
import { Badge, type BadgeStatus } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/** Normalized view model shared by the history and dashboard lists. */
export interface TransferItemView {
  id: string;
  type: "sent" | "received";
  counterpartyName: string;
  amountFiat: number;
  currency: string;
  status: string;
  createdAt: string; // ISO string
}

function toBadgeStatus(status: string): BadgeStatus {
  return status === "completed" || status === "pending" || status === "failed"
    ? status
    : "neutral";
}

/** Formats an ISO timestamp as "Jun 14, 2026 · 3:42 PM". */
function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${day} · ${time}`;
}

export function TransferRow({ transfer }: { transfer: TransferItemView }) {
  const isSent = transfer.type === "sent";
  const Icon = isSent ? ArrowUpRight : ArrowDownLeft;
  const sign = isSent ? "−" : "+";

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-surface",
            isSent ? "text-error" : "text-success"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">
            {isSent ? "To" : "From"} {transfer.counterpartyName}
          </span>
          <span className="text-xs text-text-muted">
            {formatDateTime(transfer.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "text-sm font-semibold",
            isSent ? "text-text-primary" : "text-success"
          )}
        >
          {sign}
          {formatFiat(transfer.amountFiat, transfer.currency)}
        </span>
        <Badge status={toBadgeStatus(transfer.status)} />
      </div>
    </li>
  );
}
