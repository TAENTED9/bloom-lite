"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        setError("Couldn't sign out. Please try again.");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="danger"
        size="lg"
        fullWidth
        loading={loading}
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {loading ? "Signing out…" : "Sign Out"}
      </Button>
      {error && <p className="text-center text-sm text-error">{error}</p>}
    </div>
  );
}
