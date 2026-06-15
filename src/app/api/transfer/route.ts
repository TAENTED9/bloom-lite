import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { executeRemittanceSwap, SwapError } from "@/services/swapService";

// Real remittance endpoint (the dry-run lives at /api/transfer/simulate).
const transferSchema = z.object({
  recipientEmail: z.string().email("Enter a valid recipient email"),
  // Amount is in the sender's own currency.
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(100, "Minimum transfer is 100")
    .max(500000, "Maximum transfer is 500,000"),
});

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = transferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const recipientEmail = parsed.data.recipientEmail.trim().toLowerCase();
  const recipient = await prisma.user.findUnique({
    where: { email: recipientEmail },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }
  if (recipient.id === auth.userId) {
    return NextResponse.json(
      { error: "You can't send money to yourself" },
      { status: 400 }
    );
  }

  try {
    const result = await executeRemittanceSwap({
      senderId: auth.userId,
      recipientId: recipient.id,
      amount: parsed.data.amount,
    });
    return NextResponse.json(
      {
        success: true,
        txSignature: result.txSignature,
        amountSent: parsed.data.amount,
        amountReceived: result.recipientAmount,
        exchangeRate: result.exchangeRate,
        senderCurrency: result.senderCurrency,
        recipientCurrency: result.recipientCurrency,
        status: "completed",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SwapError) {
      // The swap layer wraps a SlippageExceededError into a SwapError before it
      // reaches here, so distinguish the two outcomes by their message.
      if (/insufficient/i.test(error.message)) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }
      if (/slippage/i.test(error.message)) {
        return NextResponse.json(
          {
            error:
              "Transaction rejected: price moved too much. Please try again.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Unable to complete transfer right now." },
      { status: 500 }
    );
  }
}
