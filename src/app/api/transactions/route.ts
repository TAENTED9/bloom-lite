import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transfers = await prisma.transfer.findMany({
    where: {
      OR: [{ senderId: auth.userId }, { recipientId: auth.userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { fullName: true, email: true } },
      recipient: { select: { fullName: true, email: true } },
    },
  });

  // Shape each transfer from the current user's perspective. Internal details
  // (txSignature, USDC amounts, wallet keys) are never exposed.
  const data = transfers.map((t) => {
    const isSent = t.senderId === auth.userId;
    const counterparty = isSent ? t.recipient : t.sender;
    return {
      id: t.id,
      type: isSent ? "sent" : "received",
      amountFiat: isSent ? t.amountFiat : t.recipientAmount,
      currency: isSent ? t.senderCurrency : t.recipientCurrency,
      counterpartyName: counterparty.fullName,
      counterpartyEmail: counterparty.email,
      exchangeRate: t.exchangeRate,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    };
  });

  return NextResponse.json(data, { status: 200 });
}
