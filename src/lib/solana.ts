import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

const DEVNET_FALLBACK = "https://api.devnet.solana.com";

export interface GeneratedKeypair {
  publicKey: string;
  privateKey: Uint8Array;
}

let connection: Connection | null = null;

/**
 * Returns a singleton Connection to the configured Solana RPC.
 * This prototype is devnet-only — the URL must always be a devnet endpoint.
 */
export function getConnection(): Connection {
  if (!connection) {
    const url = process.env.SOLANA_RPC_URL || DEVNET_FALLBACK;
    connection = new Connection(url, "confirmed");
  }
  return connection;
}

/**
 * Generates a fresh Solana keypair.
 * The private key is returned as the raw 64-byte secret key array.
 */
export function generateKeypair(): GeneratedKeypair {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: keypair.secretKey,
  };
}

/**
 * Reconstructs a Keypair from a stored 64-byte secret key.
 */
export function keypairFromSecret(secret: Uint8Array): Keypair {
  return Keypair.fromSecretKey(secret);
}

/**
 * Fetches the SOL balance (in SOL, not lamports) for a public key from devnet.
 */
export async function getDevnetBalance(publicKey: string): Promise<number> {
  const lamports = await getConnection().getBalance(new PublicKey(publicKey));
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Requests a 1 SOL devnet airdrop for testing. Best-effort: devnet airdrops are
 * frequently rate-limited, so failures are swallowed and reported via the return.
 */
export async function requestDevnetAirdrop(
  publicKey: string
): Promise<{ ok: boolean; signature?: string; error?: string }> {
  try {
    const conn = getConnection();
    const signature = await conn.requestAirdrop(
      new PublicKey(publicKey),
      LAMPORTS_PER_SOL
    );
    return { ok: true, signature };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "airdrop failed",
    };
  }
}
