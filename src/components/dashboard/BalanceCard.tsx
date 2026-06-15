"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface BalanceCardProps {
  formattedBalance: string;
  currency: string;
}

export function BalanceCard({ formattedBalance, currency }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

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
          <button
            type="button"
            onClick={() => setHidden((prev) => !prev)}
            aria-label={hidden ? "Show balance" : "Hide balance"}
            title={hidden ? "Show balance" : "Hide balance"}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {hidden ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={
              hidden
                ? "select-none text-5xl font-bold tracking-tight text-text-primary"
                : "text-5xl font-bold tracking-tight text-text-primary"
            }
          >
            {hidden ? "••••••" : formattedBalance}
          </span>
        </div>
        <span className="text-sm text-text-muted">
          Available balance · {currency}
        </span>
      </div>
    </Card>
  );
}
