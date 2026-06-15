import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      country: true,
      currency: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // No password hash, no wallet keys.
  return NextResponse.json(user, { status: 200 });
}
