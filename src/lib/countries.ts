// Country registry for the Bloom Lite corridors.
//
// PROTOTYPE ONLY: Japan (sender origin) and Nigeria (recipient) are the only
// AVAILABLE countries in this demo. Every other destination is listed in the
// UI so the experience reflects the planned product, but is marked
// `available: false` and cannot be selected yet.
// Production will open dynamic corridors (JP -> NG, JP -> GH, JP -> KE,
// JP -> IN, JP -> PH, etc.).

export type CountryCode = "JP" | "NG" | "GH" | "KE" | "IN" | "PH";

export interface Country {
  code: CountryCode;
  label: string;
  flag: string;
  currency: string;
  /** Whether the country can be selected in this prototype. */
  available: boolean;
}

export const COUNTRIES: Country[] = [
  { code: "JP", label: "Japan", flag: "🇯🇵", currency: "JPY", available: true },
  { code: "NG", label: "Nigeria", flag: "🇳🇬", currency: "NGN", available: true },
  // Coming soon — listed for the demo but unavailable in the prototype.
  { code: "GH", label: "Ghana", flag: "🇬🇭", currency: "GHS", available: false },
  { code: "KE", label: "Kenya", flag: "🇰🇪", currency: "KES", available: false },
  { code: "IN", label: "India", flag: "🇮🇳", currency: "INR", available: false },
  { code: "PH", label: "Philippines", flag: "🇵🇭", currency: "PHP", available: false },
];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [
  CountryCode,
  ...CountryCode[],
];

const COUNTRY_BY_CODE = new Map<CountryCode, Country>(
  COUNTRIES.map((c) => [c.code, c])
);

export function getCountry(code: CountryCode): Country | undefined {
  return COUNTRY_BY_CODE.get(code);
}

export function isCountryAvailable(code: CountryCode): boolean {
  return getCountry(code)?.available ?? false;
}
