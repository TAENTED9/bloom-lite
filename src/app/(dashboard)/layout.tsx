import { redirect } from "next/navigation";
import { Flower2 } from "lucide-react";
import { getAuthUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SidebarNav, BottomNav } from "@/components/dashboard/DashboardNav";

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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-card-border bg-surface px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-3">
          <Flower2 className="h-6 w-6 text-brand" />
          <span className="text-lg font-semibold text-text-primary">
            Bloom Lite
          </span>
        </div>
        <SidebarNav />
      </aside>

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-card-border bg-surface/60 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Flower2 className="h-5 w-5 text-brand" />
            <span className="font-semibold text-text-primary">Bloom Lite</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-text-muted sm:block">
              {user.fullName}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {initials}
            </span>
          </div>
        </header>

        <main className="px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
