import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCountry, type CountryCode } from "@/lib/countries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

function initialsFrom(fullName: string): string {
  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "B"
  );
}

function countryLabel(code: string): string {
  const country = getCountry(code as CountryCode);
  return country ? `${country.label} ${country.flag}` : code;
}

export default async function SettingsPage() {
  const auth = await getAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      fullName: true,
      email: true,
      country: true,
      currency: true,
    },
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted">Your account details.</p>
      </div>

      <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-semibold text-white">
          {initialsFrom(user.fullName)}
        </span>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">
            {user.fullName}
          </h2>
          <Badge status="neutral">Personal</Badge>
        </div>
      </Card>

      <Card padding="none">
        <dl className="divide-y divide-card-border">
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm text-text-muted">Full name</dt>
            <dd className="text-sm font-medium text-text-primary">
              {user.fullName}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm text-text-muted">Email</dt>
            <dd className="text-sm font-medium text-text-primary">
              {user.email}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm text-text-muted">Country</dt>
            <dd className="text-sm font-medium text-text-primary">
              {countryLabel(user.country)}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm text-text-muted">Currency</dt>
            <dd className="text-sm font-medium text-text-primary">
              {user.currency}
            </dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm text-text-muted">Account type</dt>
            <dd>
              <Badge status="neutral">Personal</Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <Card
        padding="md"
        className="flex items-start gap-3 border-brand/30 bg-brand/10"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
        <p className="text-sm text-text-muted">
          This is a demo prototype. No real money is moved.
        </p>
      </Card>

      <SignOutButton />
    </div>
  );
}
