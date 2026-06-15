import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { generateKeypair, requestDevnetAirdrop } from "@/lib/solana";
import { formatFiat } from "@/lib/fx";

// Seeded mock balances for the prototype.
const SEED_BALANCES: Record<string, number> = {
  JPY: 150_000,
  NGN: 0,
};

export interface PublicWalletBalance {
  balance: number;
  currency: string;
  formattedBalance: string;
}

/**
 * Internal-only shape that includes the decrypted signing key.
 * NEVER return this from an API route.
 */
export interface DecryptedWallet {
  id: string;
  userId: string;
  publicKey: string;
  secretKey: Uint8Array;
  balanceUsdc: number;
  balanceFiat: number;
  fiatCurrency: string;
}

/**
 * Creates a custodial wallet for a user: generates a Solana keypair, encrypts
 * the private key at rest, seeds a mock fiat balance, and (best-effort)
 * requests a devnet airdrop for testing.
 */
export async function createWallet(userId: string, fiatCurrency: string) {
  const { publicKey, privateKey } = generateKeypair();
  const encryptedPrivateKey = encrypt(Buffer.from(privateKey).toString("base64"));
  const seededFiat = SEED_BALANCES[fiatCurrency] ?? 0;

  const wallet = await prisma.wallet.create({
    data: {
      userId,
      encryptedPrivateKey,
      publicKey,
      balanceFiat: seededFiat,
      balanceUsdc: 0,
      fiatCurrency,
      network: "devnet",
    },
  });

  // Best-effort devnet airdrop for testing — failures must not block signup.
  void requestDevnetAirdrop(publicKey);

  return { id: wallet.id, publicKey };
}

/**
 * Returns ONLY the fiat-facing balance and currency. Never exposes the public
 * key or the encrypted/decrypted private key to the API layer.
 */
export async function getWalletBalance(
  userId: string
): Promise<PublicWalletBalance | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balanceFiat: true, fiatCurrency: true },
  });
  if (!wallet) return null;
  return {
    balance: wallet.balanceFiat,
    currency: wallet.fiatCurrency,
    formattedBalance: formatFiat(wallet.balanceFiat, wallet.fiatCurrency),
  };
}

/**
 * Internal helper — loads a wallet and decrypts its signing key.
 * For use by the swap layer only; must never cross the API boundary.
 */
export async function getDecryptedWallet(
  userId: string
): Promise<DecryptedWallet | null> {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return null;
  const secretB64 = decrypt(wallet.encryptedPrivateKey);
  const secretKey = new Uint8Array(Buffer.from(secretB64, "base64"));
  return {
    id: wallet.id,
    userId: wallet.userId,
    publicKey: wallet.publicKey,
    secretKey,
    balanceUsdc: wallet.balanceUsdc,
    balanceFiat: wallet.balanceFiat,
    fiatCurrency: wallet.fiatCurrency,
  };
}

/** Internal use only — updates a wallet's display fiat balance. */
export async function updateFiatBalance(walletId: string, newBalance: number) {
  await prisma.wallet.update({
    where: { id: walletId },
    data: { balanceFiat: newBalance },
  });
}

/** Internal use only — updates a wallet's USDC + fiat balances together. */
export async function updateWalletBalances(
  walletId: string,
  balanceUsdc: number,
  balanceFiat: number
) {
  await prisma.wallet.update({
    where: { id: walletId },
    data: { balanceUsdc, balanceFiat },
  });
}
