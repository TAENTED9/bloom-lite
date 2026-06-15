import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { getWalletBalance } from "@/services/walletService";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getWalletBalance(auth.userId);
  if (!balance) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  // Returns fiat only — never the public key or any signing material.
  return NextResponse.json(balance, { status: 200 });
}
