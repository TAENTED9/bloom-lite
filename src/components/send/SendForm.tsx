"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatFiat } from "@/lib/fx";

interface SimulationResponse {
  estimatedRecipientAmount: number;
  exchangeRate: number;
  senderCurrency: string;
  recipientCurrency: string;
  slippageBps: number;
  priorityFee: number;
  estimatedTime: string;
  recipientName: string;
}

interface TransferResponse {
  success: true;
  txSignature: string;
  amountSent: number;
  amountReceived: number;
  exchangeRate: number;
  senderCurrency: string;
  recipientCurrency: string;
  status: string;
}

type ConfirmError =
  | { kind: "slippage"; message: string }
  | { kind: "generic"; message: string };

type Step = "details" | "confirm" | "success";

/** Derives a currency's symbol from formatFiat so it matches amounts shown elsewhere. */
function currencySymbol(currency: string): string {
  return formatFiat(0, currency).replace(/[\d.,\s]/g, "") || currency;
}

/** "¥1 = ₦10.19" — adapts precision for sub-1 rates (e.g. NGN -> JPY). */
function formatRate(from: string, to: string, rate: number): string {
  const value = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: rate < 1 ? 4 : 2,
  }).format(rate);
  return `${currencySymbol(from)}1 = ${currencySymbol(to)}${value}`;
}

export function SendForm({ senderCurrency }: { senderCurrency: string }) {
  const [step, setStep] = useState<Step>("details");

  const [recipientEmail, setRecipientEmail] = useState("");
  // Raw digits only; the displayed value is grouped (e.g. "10,000").
  const [amountDigits, setAmountDigits] = useState("");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<ConfirmError | null>(null);

  const [result, setResult] = useState<TransferResponse | null>(null);

  const symbol = currencySymbol(senderCurrency);
  const amount = amountDigits === "" ? 0 : Number(amountDigits);
  const amountDisplay = amountDigits === "" ? "" : amount.toLocaleString("en-US");
  const amountValid = amount >= 100;

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Strip everything except digits, then re-group on render.
    setAmountDigits(event.target.value.replace(/\D/g, ""));
  }

  async function handlePreview(event: React.FormEvent) {
    event.preventDefault();
    setPreviewError(null);

    if (!recipientEmail.trim()) {
      setPreviewError("Enter the recipient's email");
      return;
    }
    if (!amountValid) {
      setPreviewError(`Enter an amount of at least ${formatFiat(100, senderCurrency)}`);
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await fetch("/api/transfer/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, recipientEmail: recipientEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error ?? "Unable to preview this transfer");
        return;
      }
      setSimulation(data as SimulationResponse);
      setStep("confirm");
    } catch {
      setPreviewError("Network error. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleConfirm() {
    setConfirmError(null);
    setConfirmLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: recipientEmail.trim(), amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422) {
          setConfirmError({
            kind: "slippage",
            message: "Price moved too quickly. Please try again.",
          });
        } else if (res.status === 400 && /insufficient/i.test(data.error ?? "")) {
          setConfirmError({
            kind: "generic",
            message: "You don't have enough balance for this transfer.",
          });
        } else {
          setConfirmError({
            kind: "generic",
            message: data.error ?? "Unable to complete this transfer.",
          });
        }
        return;
      }
      setResult(data as TransferResponse);
      setStep("success");
    } catch {
      setConfirmError({
        kind: "generic",
        message: "Network error. Please try again.",
      });
    } finally {
      setConfirmLoading(false);
    }
  }

  function resetForm() {
    setStep("details");
    setRecipientEmail("");
    setAmountDigits("");
    setSimulation(null);
    setResult(null);
    setPreviewError(null);
    setConfirmError(null);
  }

  if (step === "confirm" && simulation) {
    return (
      <Card padding="lg" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 border-b border-card-border pb-4">
          <span className="text-xs uppercase tracking-wide text-text-muted">
            Sending to
          </span>
          <span className="text-base font-semibold text-text-primary">
            {simulation.recipientName}
          </span>
          <span className="text-sm text-text-muted">{recipientEmail}</span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">You send</span>
            <span className="text-lg font-semibold text-text-primary">
              {formatFiat(amount, simulation.senderCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">They receive</span>
            <span className="text-lg font-semibold text-success">
              {formatFiat(
                simulation.estimatedRecipientAmount,
                simulation.recipientCurrency
              )}
            </span>
          </div>
          <div className="h-px bg-card-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Rate</span>
            <span className="text-sm font-medium text-text-primary">
              {formatRate(
                simulation.senderCurrency,
                simulation.recipientCurrency,
                simulation.exchangeRate
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Estimated time</span>
            <span className="text-sm font-medium text-text-primary">
              ~2 seconds
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Transfer fee</span>
            <span className="text-sm font-medium text-text-primary">
              {formatFiat(0, simulation.senderCurrency)} (Prototype)
            </span>
          </div>
        </div>

        {confirmError && (
          <div className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{confirmError.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            fullWidth
            loading={confirmLoading}
            onClick={handleConfirm}
          >
            {confirmLoading
              ? "Sending…"
              : confirmError?.kind === "slippage"
                ? "Retry"
                : "Confirm & Send"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            disabled={confirmLoading}
            onClick={() => {
              setConfirmError(null);
              setStep("details");
            }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  if (step === "success" && result) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-text-primary">
            Transfer Complete!
          </h2>
          <p className="text-sm text-text-muted">Your money is on its way.</p>
        </div>

        <div className="w-full rounded-xl bg-surface px-5 py-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-text-muted">You sent</span>
            <span className="text-sm font-semibold text-text-primary">
              {formatFiat(result.amountSent, result.senderCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-text-muted">They received</span>
            <span className="text-sm font-semibold text-success">
              {formatFiat(result.amountReceived, result.recipientCurrency)}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button size="lg" fullWidth onClick={resetForm}>
            Send Another
          </Button>
          <Link href="/history" className="block">
            <Button variant="secondary" size="lg" fullWidth>
              View History
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <form onSubmit={handlePreview} className="flex flex-col gap-4" noValidate>
        <Input
          label="Recipient email"
          type="email"
          autoComplete="off"
          placeholder="recipient@example.com"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          required
        />
        <Input
          label={`Amount in ${senderCurrency} ${symbol}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="10,000"
          value={amountDisplay}
          onChange={handleAmountChange}
          required
        />
        {previewError && (
          <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {previewError}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={previewLoading}>
          {previewLoading ? "Calculating…" : "Preview Transfer"}
        </Button>
      </form>
    </Card>
  );
}
