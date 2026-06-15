import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";
import { authCookieOptions } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  // Expire the auth cookie immediately (same options, maxAge 0).
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions(),
    maxAge: 0,
  });
  return response;
}
