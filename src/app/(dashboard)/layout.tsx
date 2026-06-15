import { redirect } from "next/navigation";
import { Flower2 } from "lucide-react";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar, BottomNav } from "@/components/dashboard/DashboardNav";

function initialsFrom(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { fullName: true, email: true },
  });
  if (!user) {
    redirect("/login");
  }

  const initials = initialsFrom(user.fullName) || "B";

  return (
    <div className="min-h-screen bg-background">
      {/* Tablet icon rail + desktop sidebar */}
      <Sidebar userName={user.fullName} initials={initials} />

      <div className="md:pl-20 lg:pl-64">
        {/* Mobile top bar — brand + avatar. Larger screens use the sidebar instead. */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-card-border bg-surface/70 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-brand" aria-hidden />
            <span className="font-semibold text-text-primary">Bloom Lite</span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials}
          </span>
        </header>

        <main className="px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-8 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomNav />
    </div>
  );
}
