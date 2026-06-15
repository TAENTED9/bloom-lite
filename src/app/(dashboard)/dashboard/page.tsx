import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Send } from "lucide-react";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/services/walletService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  TransferRow,
  type TransferItemView,
} from "@/components/dashboard/TransferRow";

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstNameOf(fullName: string): string {
  return fullName.split(" ").filter(Boolean)[0] ?? fullName;
}

export default async function DashboardPage() {
  const auth = await getAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const [user, balance, recentTransfers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true },
    }),
    getWalletBalance(auth.userId),
    prisma.transfer.findMany({
      where: {
        OR: [{ senderId: auth.userId }, { recipientId: auth.userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        sender: { select: { fullName: true } },
        recipient: { select: { fullName: true } },
      },
    }),
  ]);
  if (!user) {
    redirect("/login");
  }

  const recent: TransferItemView[] = recentTransfers.map((t) => {
    const isSent = t.senderId === auth.userId;
    return {
      id: t.id,
      type: isSent ? "sent" : "received",
      counterpartyName: isSent ? t.recipient.fullName : t.sender.fullName,
      amountFiat: isSent ? t.amountFiat : t.recipientAmount,
      currency: isSent ? t.senderCurrency : t.recipientCurrency,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    };
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting(new Date())}, {firstNameOf(user.fullName)} 👋
        </h1>
        <p className="text-sm text-text-muted">
          Here&apos;s your account at a glance.
        </p>
      </div>

      <BalanceCard
        formattedBalance={balance?.formattedBalance ?? "—"}
        currency={balance?.currency ?? ""}
      />

      <QuickActions />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-muted">Recent activity</h2>
        {recent.length === 0 ? (
          <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-text-muted">
              Make your first transfer and it&apos;ll show up here.
            </p>
            <Link href="/send" className="block">
              <Button size="md">
                <Send className="h-4 w-4" aria-hidden />
                Make your first transfer
              </Button>
            </Link>
          </Card>
        ) : (
          <Card padding="none">
            <ul className="divide-y divide-card-border">
              {recent.map((t) => (
                <TransferRow key={t.id} transfer={t} />
              ))}
            </ul>
          </Card>
        )}
      </section>

      <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-text-muted/70">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Powered by blockchain technology
      </div>
    </div>
  );
}
