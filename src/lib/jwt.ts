import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "bloom_token";

export interface BloomTokenPayload extends JWTPayload {
  userId: string;
  email: string;
}

const TOKEN_TTL = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT containing the given payload. Expires in 7 days.
 */
export async function signToken(
  payload: Pick<BloomTokenPayload, "userId" | "email">
): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

/**
 * Verifies a JWT and returns its decoded payload.
 * Returns null when the token is missing, malformed, or expired.
 */
export async function verifyToken(
  token: string | undefined | null
): Promise<BloomTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return payload as BloomTokenPayload;
  } catch {
    return null;
  }
}
