import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { simulateRemittanceSwap, SwapError } from "@/services/swapService";

const simulateSchema = z.object({
  // Amount is in the sender's own currency.
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  // Resolve the recipient up front so the preview can fail fast (404) and show
  // the recipient's name on the confirmation card.
  recipientEmail: z.string().email("Enter a valid recipient email"),
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

  const parsed = simulateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const recipientEmail = parsed.data.recipientEmail.trim().toLowerCase();
  const recipient = await prisma.user.findUnique({
    where: { email: recipientEmail },
    select: { id: true, fullName: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  try {
    const result = await simulateRemittanceSwap({
      senderId: auth.userId,
      recipientId: recipient.id,
      amount: parsed.data.amount,
    });
    return NextResponse.json(
      { ...result, recipientName: recipient.fullName },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SwapError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Unable to simulate transfer right now." },
      { status: 500 }
    );
  }
}
