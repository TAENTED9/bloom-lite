import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// Jupiter swap layer — SIMULATED for the Bloom Lite devnet prototype.
// No real on-chain transactions are submitted. Swap results are mocked so the
// product can be demoed end-to-end without funded accounts or mainnet access.
// ---------------------------------------------------------------------------

export interface SwapConfig {
  slippageBps: number; // 50 = 0.5% max slippage — reject if exceeded
  priorityFeeLamports: number; // 10000 lamports — outcompetes MEV bots
  onlyDirectRoutes: boolean; // false — allow multi-hop for best price
  asLegacyTransaction: boolean; // false — use versioned transactions (v0)
}

export const DEFAULT_SWAP_CONFIG: SwapConfig = {
  slippageBps: 50,
  priorityFeeLamports: 10000,
  onlyDirectRoutes: false,
  asLegacyTransaction: false,
};

export type CongestionTier = "low" | "medium" | "high";

const PRIORITY_FEE_TIERS: Record<CongestionTier, number> = {
  low: 5000,
  medium: 10000,
  high: 25000,
};

export class SlippageExceededError extends Error {
  readonly deviationBps: number;
  readonly maxBps: number;
  constructor(deviationBps: number, maxBps: number) {
    super(
      `Slippage ${deviationBps.toFixed(
        1
      )} bps exceeded the maximum allowed ${maxBps} bps`
    );
    this.name = "SlippageExceededError";
    this.deviationBps = deviationBps;
    this.maxBps = maxBps;
  }
}

export interface BuildSwapParams {
  /** Amount of USDC being swapped through the corridor. */
  amountUsdc: number;
  /** Optional overrides for the default MEV-protected swap config. */
  config?: Partial<SwapConfig>;
}

export interface SwapTransaction {
  amountUsdc: number;
  /** Price the route was quoted at (output per input — 1.0 for a USDC pass-through). */
  quotedPrice: number;
  /** Expected output in USDC after the quoted route. */
  expectedOutUsdc: number;
  config: SwapConfig;
  /** Simulated multi-hop route description. */
  routePlan: string[];
}

export interface ExecuteSwapParams {
  transaction: SwapTransaction;
  /** Decrypted sender secret key — used only to "sign" the simulated tx. */
  secretKey: Uint8Array;
}

export interface SwapResult {
  txSignature: string;
  /** Actual fill price after simulated network conditions. */
  executionPrice: number;
  outputUsdc: number;
  slippageBps: number;
  priorityFeeLamports: number;
}

/**
 * Returns a dynamic priority-fee estimate based on (simulated) network
 * congestion. Higher fees outcompete MEV/sandwich bots for block inclusion.
 */
export function estimatePriorityFee(
  tier: CongestionTier = "medium"
): number {
  return PRIORITY_FEE_TIERS[tier];
}

/**
 * Throws {@link SlippageExceededError} when the execution price deviates from
 * the quoted price by more than `maxBps` basis points.
 */
export function validateSlippage(
  quotedPrice: number,
  executionPrice: number,
  maxBps: number
): void {
  if (quotedPrice <= 0) {
    throw new Error("Quoted price must be positive");
  }
  const deviationBps =
    (Math.abs(executionPrice - quotedPrice) / quotedPrice) * 10_000;
  if (deviationBps > maxBps) {
    throw new SlippageExceededError(deviationBps, maxBps);
  }
}

/**
 * Builds a Jupiter quote + swap transaction with the MEV-protection config.
 * Simulated: the corridor routes USDC through a stable path, so the quoted
 * price is ~1.0 with a tiny route cost.
 */
export function buildSwapTransaction(params: BuildSwapParams): SwapTransaction {
  const config: SwapConfig = { ...DEFAULT_SWAP_CONFIG, ...params.config };
  if (params.amountUsdc <= 0) {
    throw new Error("Swap amount must be positive");
  }
  // Simulated route cost (~0.1%) folded into the quoted price.
  const quotedPrice = 0.999;
  const expectedOutUsdc = params.amountUsdc * quotedPrice;
  const routePlan = config.onlyDirectRoutes
    ? ["USDC->USDC"]
    : ["USDC->USDT", "USDT->USDC"];

  return {
    amountUsdc: params.amountUsdc,
    quotedPrice,
    expectedOutUsdc,
    config,
    routePlan,
  };
}

/**
 * "Signs" with the user's decrypted keypair and submits to devnet.
 * For the prototype this simulates the fill: it applies a small random price
 * movement within tolerance and returns a mock txSignature.
 */
export async function executeSwap(
  params: ExecuteSwapParams
): Promise<SwapResult> {
  const { transaction, secretKey } = params;
  if (!secretKey || secretKey.length === 0) {
    throw new Error("A valid signing key is required to execute the swap");
  }

  const { quotedPrice, config } = transaction;
  // Simulate a small fill deviation that stays within the allowed slippage.
  const maxDeviation = (config.slippageBps / 10_000) * 0.8; // 80% of tolerance
  const deviation = (Math.random() * 2 - 1) * maxDeviation;
  const executionPrice = quotedPrice * (1 + deviation);
  const outputUsdc = transaction.amountUsdc * executionPrice;

  return {
    txSignature: `sim_${nanoid()}`,
    executionPrice,
    outputUsdc,
    slippageBps: config.slippageBps,
    priorityFeeLamports: config.priorityFeeLamports,
  };
}
