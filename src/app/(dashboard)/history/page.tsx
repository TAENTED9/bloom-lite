"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TransferRow, type TransferItemView } from "@/components/dashboard/TransferRow";

function HistorySkeleton() {
  return (
    <Card padding="none">
      <ul className="divide-y divide-card-border">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 animate-pulse rounded-full bg-surface" />
              <div className="flex flex-col gap-2">
                <span className="h-3.5 w-32 animate-pulse rounded bg-surface" />
                <span className="h-3 w-24 animate-pulse rounded bg-surface" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="h-3.5 w-20 animate-pulse rounded bg-surface" />
              <span className="h-4 w-16 animate-pulse rounded-full bg-surface" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card padding="lg" className="flex flex-col items-center gap-4 py-12 text-center">
      <History className="h-14 w-14 text-text-muted/50" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-text-primary">
          No transfers yet
        </p>
        <p className="text-sm text-text-muted">
          Your transfers will show up here.
        </p>
      </div>
      <Link
        href="/send"
        className="text-sm font-medium text-brand hover:underline"
      >
        Send money
      </Link>
    </Card>
  );
}

export default function HistoryPage() {
  const [transfers, setTransfers] = useState<TransferItemView[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "Unable to load your transfers");
          return;
        }
        setTransfers(data as TransferItemView[]);
      } catch {
        if (active) setError("Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">History</h1>
        <p className="text-sm text-text-muted">Every transfer you&apos;ve made.</p>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-error">{error}</p>
        </Card>
      ) : transfers && transfers.length > 0 ? (
        <Card padding="none">
          <ul className="divide-y divide-card-border">
            {transfers.map((t) => (
              <TransferRow key={t.id} transfer={t} />
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
