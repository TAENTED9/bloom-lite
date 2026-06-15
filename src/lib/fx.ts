// Hardcoded simulated exchange rates for the Bloom Lite prototype.
// In production these would come from a live FX/liquidity provider.

/** 1 USDC = 155 JPY */
export const JPY_PER_USDC = 155;
/** 1 USDC = 1580 NGN */
export const NGN_PER_USDC = 1580;
/** Derived full-corridor rate: 1 JPY = ~10.19 NGN */
export const NGN_PER_JPY = NGN_PER_USDC / JPY_PER_USDC;

/** Converts a JPY amount into its internal USDC equivalent. */
export function jpyToUsdc(jpy: number): number {
  return jpy / JPY_PER_USDC;
}

/** Converts a USDC amount into NGN. */
export function usdcToNgn(usdc: number): number {
  return usdc * NGN_PER_USDC;
}

/** Full corridor conversion: JPY -> NGN. */
export function jpyToNgn(jpy: number): number {
  return usdcToNgn(jpyToUsdc(jpy));
}

/**
 * USDC price of one unit of each supported fiat currency. The remittance
 * corridor routes every transfer through USDC, so any supported currency can
 * convert to any other (e.g. JPY -> NGN or NGN -> JPY). Built from the existing
 * per-currency rate constants above.
 */
export const USDC_RATES: Record<string, number> = {
  JPY: JPY_PER_USDC,
  NGN: NGN_PER_USDC,
};

function rateFor(currency: string): number {
  const rate = USDC_RATES[currency];
  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return rate;
}

/** Converts an amount in any supported fiat currency into USDC. */
export function toUsdc(amount: number, currency: string): number {
  return amount / rateFor(currency);
}

/** Converts a USDC amount into any supported fiat currency. */
export function fromUsdc(usdc: number, currency: string): number {
  return usdc * rateFor(currency);
}

/** Full-corridor rate: how many units of `to` one unit of `from` buys. */
export function corridorRate(from: string, to: string): number {
  return rateFor(to) / rateFor(from);
}

const CURRENCY_LOCALES: Record<string, string> = {
  JPY: "ja-JP",
  NGN: "en-NG",
  USD: "en-US",
};

/**
 * Formats a monetary amount using the correct locale and currency symbol,
 * e.g. formatFiat(150000, "JPY") -> "¥150,000".
 */
export function formatFiat(amount: number, currency: string): string {
  const locale = CURRENCY_LOCALES[currency] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}
