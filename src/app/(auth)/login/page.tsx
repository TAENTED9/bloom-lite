import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f0f1a] via-[#141432] to-[#0f0f1a] px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-text-primary"
        >
          <Flower2 className="h-6 w-6 text-brand" />
          <span className="text-lg font-semibold">Bloom Lite</span>
        </Link>
        <Card padding="lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-text-muted">
              Sign in to send money home.
            </p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
