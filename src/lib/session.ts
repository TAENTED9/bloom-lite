import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyToken, type BloomTokenPayload } from "@/lib/jwt";

/**
 * Reads and verifies the bloom_token httpOnly cookie.
 * Returns the token payload or null when unauthenticated.
 */
export async function getAuthUser(): Promise<BloomTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifyToken(token);
}

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

/** Standard options for the auth cookie. */
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  };
}
