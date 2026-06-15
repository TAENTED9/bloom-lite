import { prisma } from "@/lib/prisma";
import {
  getDecryptedWallet,
  updateWalletBalances,
} from "@/services/walletService";
import { toUsdc, fromUsdc, corridorRate } from "@/lib/fx";
import {
  buildSwapTransaction,
  executeSwap,
  validateSlippage,
  estimatePriorityFee,
  DEFAULT_SWAP_CONFIG,
  SlippageExceededError,
} from "@/lib/jupiter";

// Corridors are bidirectional: the sender and recipient currencies are resolved
// from each user's wallet, so money flows Japan -> other countries and other
// countries -> Japan (JP <-> NG today; more corridors as countries open up).
export class SwapError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "SwapError";
    this.status = status;
  }
}

export interface RemittanceParams {
  senderId: string;
  recipientId: string;
  /** Amount in the sender's own currency. */
  amount: number;
}

export interface RemittanceResult {
  success: true;
  txSignature: string;
  recipientAmount: number;
  exchangeRate: number;
  senderCurrency: string;
  recipientCurrency: string;
}

export interface SimulationResult {
  estimatedRecipientAmount: number;
  exchangeRate: number;
  senderCurrency: string;
  recipientCurrency: string;
  slippageBps: number;
  priorityFee: number;
  estimatedTime: string;
}

/**
 * Runs the dry-run portion of a remittance (steps 1–6): load the sender wallet,
 * convert JPY -> USDC, validate funds, build the MEV-protected swap, simulate
 * execution, and validate slippage. Commits nothing to the DB.
 */
export async function simulateRemittanceSwap(
  params: RemittanceParams
): Promise<SimulationResult> {
  const { senderId, recipientId, amount } = params;
  if (amount <= 0) {
    throw new SwapError("Transfer amount must be greater than zero");
  }

  const senderWallet = await getDecryptedWallet(senderId);
  if (!senderWallet) {
    throw new SwapError("Sender account not found", 404);
  }
  // The recipient's currency drives the destination conversion. Only their
  // currency is needed for a dry run, so avoid decrypting their signing key.
  const recipientWallet = await prisma.wallet.findUnique({
    where: { userId: recipientId },
    select: { fiatCurrency: true },
  });
  if (!recipientWallet) {
    throw new SwapError("Recipient account not found", 404);
  }
  const senderCurrency = senderWallet.fiatCurrency;
  const recipientCurrency = recipientWallet.fiatCurrency;

  const amountUsdc = toUsdc(amount, senderCurrency);
  if (senderWallet.balanceFiat < amount) {
    throw new SwapError("Insufficient balance for this transfer", 422);
  }

  const priorityFee = estimatePriorityFee("medium");
  const swapTx = buildSwapTransaction({
    amountUsdc,
    config: { ...DEFAULT_SWAP_CONFIG, priorityFeeLamports: priorityFee },
  });

  const result = await executeSwap({
    transaction: swapTx,
    secretKey: senderWallet.secretKey,
  });

  validateSlippage(
    swapTx.quotedPrice,
    result.executionPrice,
    swapTx.config.slippageBps
  );

  const estimatedRecipientAmount = fromUsdc(result.outputUsdc, recipientCurrency);

  return {
    estimatedRecipientAmount,
    exchangeRate: corridorRate(senderCurrency, recipientCurrency),
    senderCurrency,
    recipientCurrency,
    slippageBps: swapTx.config.slippageBps,
    priorityFee,
    estimatedTime: "~2s",
  };
}

/**
 * Executes a full remittance and commits balances + a Transfer record.
 */
export async function executeRemittanceSwap(
  params: RemittanceParams
): Promise<RemittanceResult> {
  const { senderId, recipientId, amount } = params;
  if (amount <= 0) {
    throw new SwapError("Transfer amount must be greater than zero");
  }

  // 1. Fetch sender wallet (decrypt private key).
  const senderWallet = await getDecryptedWallet(senderId);
  if (!senderWallet) {
    throw new SwapError("Sender account not found", 404);
  }
  const recipientWallet = await getDecryptedWallet(recipientId);
  if (!recipientWallet) {
    throw new SwapError("Recipient account not found", 404);
  }

  // Currencies are resolved per wallet, so the corridor runs in either
  // direction (JP -> NG or NG -> JP).
  const senderCurrency = senderWallet.fiatCurrency;
  const recipientCurrency = recipientWallet.fiatCurrency;

  // 2. Convert the sender's amount to USDC.
  const amountUsdc = toUsdc(amount, senderCurrency);

  // 3. Validate sufficient balance.
  if (senderWallet.balanceFiat < amount) {
    throw new SwapError("Insufficient balance for this transfer", 422);
  }

  // 4. Build Jupiter swap transaction with MEV protection.
  const priorityFee = estimatePriorityFee("medium");
  const swapTx = buildSwapTransaction({
    amountUsdc,
    config: { ...DEFAULT_SWAP_CONFIG, priorityFeeLamports: priorityFee },
  });

  // 5. Execute swap (simulated on devnet).
  let result;
  try {
    result = await executeSwap({
      transaction: swapTx,
      secretKey: senderWallet.secretKey,
    });
    // 6. Validate slippage not exceeded.
    validateSlippage(
      swapTx.quotedPrice,
      result.executionPrice,
      swapTx.config.slippageBps
    );
  } catch (error) {
    const reason =
      error instanceof SlippageExceededError
        ? error.message
        : error instanceof Error
          ? error.message
          : "swap failed";
    await prisma.transfer.create({
      data: {
        senderId,
        recipientId,
        amountFiat: amount,
        amountUsdc,
        recipientAmount: 0,
        senderCurrency,
        recipientCurrency,
        exchangeRate: corridorRate(senderCurrency, recipientCurrency),
        slippageBps: swapTx.config.slippageBps,
        status: "failed",
        failureReason: reason,
      },
    });
    throw new SwapError(reason, 422);
  }

  // 7. Convert received USDC to the recipient's currency.
  const recipientAmount = fromUsdc(result.outputUsdc, recipientCurrency);

  // 8. Update both wallet balances.
  await updateWalletBalances(
    senderWallet.id,
    Math.max(0, senderWallet.balanceUsdc - amountUsdc),
    Math.max(0, senderWallet.balanceFiat - amount)
  );
  await updateWalletBalances(
    recipientWallet.id,
    recipientWallet.balanceUsdc + result.outputUsdc,
    recipientWallet.balanceFiat + recipientAmount
  );

  // 9. Record the Transfer with full metadata.
  await prisma.transfer.create({
    data: {
      senderId,
      recipientId,
      amountFiat: amount,
      amountUsdc,
      recipientAmount,
      senderCurrency,
      recipientCurrency,
      exchangeRate: corridorRate(senderCurrency, recipientCurrency),
      slippageBps: swapTx.config.slippageBps,
      txSignature: result.txSignature,
      status: "completed",
    },
  });

  // 10. Return result.
  return {
    success: true,
    txSignature: result.txSignature,
    recipientAmount,
    exchangeRate: corridorRate(senderCurrency, recipientCurrency),
    senderCurrency,
    recipientCurrency,
  };
}
