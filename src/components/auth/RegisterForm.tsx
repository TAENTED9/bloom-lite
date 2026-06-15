"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, type CountryCode } from "@/lib/countries";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<CountryCode>("JP");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, country }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Ada Okafor"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-medium text-text-muted">
          Country
        </label>
        <div className="relative">
          {/* PROTOTYPE: only available countries (Japan + Nigeria) are
              selectable. The rest stay in the list but are disabled. */}
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value as CountryCode)}
            className="h-11 w-full appearance-none rounded-xl border border-card-border bg-surface px-4 pr-10 text-text-primary transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} disabled={!c.available}>
                {c.flag} {c.label}
                {c.available ? "" : " — Coming soon"}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
        </div>
      </div>
      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading}>
        {loading ? "Creating account…" : "Get Started"}
      </Button>
      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
