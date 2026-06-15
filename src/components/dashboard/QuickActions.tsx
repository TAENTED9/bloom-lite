import Link from "next/link";
import { Send, History } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ACTIONS = [
  {
    href: "/send",
    label: "Send Money",
    description: "To family abroad",
    icon: Send,
    accent: "bg-brand text-white",
  },
  {
    href: "/history",
    label: "View History",
    description: "Past transfers",
    icon: History,
    accent: "bg-surface text-text-primary",
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href} className="block">
            <Card
              padding="md"
              className="flex items-center gap-4 transition-colors hover:border-brand/60"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-text-primary">
                  {action.label}
                </span>
                <span className="text-sm text-text-muted">
                  {action.description}
                </span>
              </span>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
