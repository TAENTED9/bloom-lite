"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send Money", icon: Send },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop sidebar navigation. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand/15 text-text-primary"
                : "text-text-muted hover:bg-surface hover:text-text-primary"
            )}
          >
            <Icon
              className={cn("h-5 w-5", active ? "text-brand" : "")}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom tab bar. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-card-border bg-surface/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-brand" : "text-text-muted"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
