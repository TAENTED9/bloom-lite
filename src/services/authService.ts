import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { createWallet } from "@/services/walletService";
import { getCountry, type CountryCode } from "@/lib/countries";

const BCRYPT_ROUNDS = 12;

export type Country = CountryCode;

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  currency: string;
}

export interface RegisterInput {
  email: string;
  fullName: string;
  password: string;
  country: Country;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

/**
 * Registers a user: hashes the password, creates the User, provisions a
 * custodial wallet (with seeded mock balance + devnet airdrop), and returns a
 * signed JWT.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  // PROTOTYPE: only countries flagged `available` (Japan + Nigeria) can sign up.
  const country = getCountry(input.country);
  if (!country || !country.available) {
    throw new AuthError("This country isn't available yet. Coming soon.", 400);
  }
  const currency = country.currency;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      fullName: input.fullName.trim(),
      passwordHash,
      country: input.country,
      currency,
    },
  });

  await createWallet(user.id, currency);

  const token = await signToken({ userId: user.id, email: user.email });
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      currency: user.currency,
    },
    token,
  };
}

/** Verifies credentials and returns a public user + signed JWT. */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-ish handling: always run a compare to reduce timing signal.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
  const valid = await bcrypt.compare(input.password, hash);

  if (!user || !valid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const token = await signToken({ userId: user.id, email: user.email });
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      currency: user.currency,
    },
    token,
  };
}
