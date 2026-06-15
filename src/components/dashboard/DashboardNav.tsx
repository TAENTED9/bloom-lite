"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flower2,
  LayoutDashboard,
  Send,
  History,
  Settings,
  LogOut,
} from "lucide-react";
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

export interface SidebarProps {
  userName: string;
  initials: string;
}

/**
 * Desktop + tablet sidebar.
 *
 * Responsive by design, no JS toggle required:
 * - Tablet (md): a compact 80px icon rail with tooltips.
 * - Desktop (lg): a full 256px sidebar with labels and a user footer.
 */
export function Sidebar({ userName, initials }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col border-r border-card-border bg-surface py-5 md:flex lg:w-64">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-2 px-3 lg:px-6"
        title="Bloom Lite"
      >
        <Flower2 className="h-7 w-7 shrink-0 text-brand" aria-hidden />
        <span className="hidden text-lg font-semibold text-text-primary lg:inline">
          Bloom Lite
        </span>
      </Link>

      {/* Primary navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                "justify-center lg:justify-start",
                active
                  ? "bg-brand/15 text-text-primary"
                  : "text-text-muted hover:bg-surface hover:text-text-primary"
              )}
            >
              {/* Active accent bar on the rail edge */}
              <span
                className={cn(
                  "absolute -left-3 top-1/2 h-7 -translate-y-1/2 rounded-r-full bg-brand transition-all",
                  active ? "w-1 opacity-100" : "w-0 opacity-0"
                )}
                aria-hidden
              />
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-brand" : "group-hover:text-text-primary"
                )}
                aria-hidden
              />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="mt-4 border-t border-card-border px-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 lg:bg-card">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials}
          </span>
          <div className="hidden min-w-0 flex-1 flex-col lg:flex">
            <span className="truncate text-sm font-medium text-text-primary">
              {userName}
            </span>
            <span className="truncate text-xs text-text-muted">
              Personal account
            </span>
          </div>
        </div>
        <NavSignOut />
      </div>
    </aside>
  );
}

/** Compact sign-out: icon-only on the rail, icon + label on desktop. */
function NavSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      title="Sign out"
      className={cn(
        "mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "justify-center lg:justify-start",
        "text-text-muted hover:bg-error/10 hover:text-error disabled:opacity-60"
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden lg:inline">
        {loading ? "Signing out…" : "Sign out"}
      </span>
    </button>
  );
}

/** Mobile bottom tab bar with safe-area padding. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-card-border bg-surface/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-brand" : "text-text-muted"
              )}
            >
              {/* Active indicator pill above the icon */}
              <span
                className={cn(
                  "absolute -top-2 h-1 rounded-full bg-brand transition-all",
                  active ? "w-6 opacity-100" : "w-0 opacity-0"
                )}
                aria-hidden
              />
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
