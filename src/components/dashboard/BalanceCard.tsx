import { Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface BalanceCardProps {
  formattedBalance: string;
  currency: string;
}

export function BalanceCard({ formattedBalance, currency }: BalanceCardProps) {
  return (
    <Card
      padding="lg"
      className="relative overflow-hidden bg-gradient-to-br from-[#1b1c4a] via-card to-card"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">
            Your Bloom Wallet
          </span>
          <Eye className="h-4 w-4 text-text-muted" aria-hidden />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight text-text-primary">
            {formattedBalance}
          </span>
        </div>
        <span className="text-sm text-text-muted">Available balance · {currency}</span>
      </div>
    </Card>
  );
}
