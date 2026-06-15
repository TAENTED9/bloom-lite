import Link from "next/link";
import {
  Flower2,
  ArrowRight,
  ArrowUpRight,
  Wallet,
  Zap,
  ShieldCheck,
  TrendingUp,
  Star,
  Quote,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Reviews", href: "#reviews" },
];

const FEATURES = [
  {
    icon: Wallet,
    title: "Real-Time Balance",
    body: "See your balance, recent transfers, and limits at a glance — always up to date.",
  },
  {
    icon: TrendingUp,
    title: "Best Exchange Rates",
    body: "Transparent rates with no hidden markups, locked in before you send a single yen.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    body: "Money reaches your family abroad in seconds, not days. No bank queues, no paperwork.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    body: "Your money and your data are protected with end-to-end encryption, around the clock.",
  },
];

const TESTIMONIALS = [
  {
    title: "Arrives in seconds.",
    body: "I send money to my mum in Lagos every month. It used to take days — now it arrives before I finish my coffee.",
    name: "Chidi O.",
    location: "Tokyo",
  },
  {
    title: "Rates I can trust.",
    body: "No hidden fees, no surprises. I always know exactly how much my family receives before I confirm.",
    name: "Amara N.",
    location: "Osaka",
  },
  {
    title: "Set up in two minutes.",
    body: "No bank visits, no forms. I created my account and sent my first transfer on my lunch break.",
    name: "Tunde A.",
    location: "Nagoya",
  },
  {
    title: "Finally, peace of mind.",
    body: "Knowing my family gets the money the same day takes a huge weight off my shoulders every month.",
    name: "Blessing E.",
    location: "Yokohama",
  },
  {
    title: "Beautifully simple.",
    body: "Everything is clear and in one place. I can see my balance and history without any confusion.",
    name: "Kelechi M.",
    location: "Sapporo",
  },
  {
    title: "Better than my bank.",
    body: "My bank charged me a fortune and took a week. Bloom is cheaper, faster, and far less stressful.",
    name: "Ifeoma R.",
    location: "Fukuoka",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      ))}
    </div>
  );
}

/** A faux browser window showing the Bloom web dashboard. */
function BrowserMockup() {
  return (
    <div className="relative w-full max-w-md">
      {/* Floating accent chips, like the inspiration's floating elements */}
      <div className="absolute -left-6 top-10 z-10 hidden rounded-xl border border-card-border bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:block animate-float">
        <span className="font-semibold text-success">+₦1,529,000</span>
        <span className="block text-[10px] text-text-muted">Delivered</span>
      </div>
      <div className="absolute -right-5 bottom-12 z-10 hidden rounded-xl border border-card-border bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:block animate-float-slow">
        <span className="flex items-center gap-1 font-semibold text-text-primary">
          <Zap className="h-3 w-3 text-brand" /> ~2s
        </span>
        <span className="block text-[10px] text-text-muted">Avg. delivery</span>
      </div>

      {/* Browser chrome */}
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-card-border bg-surface px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-error/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <div className="ml-3 flex-1 truncate rounded-md bg-card px-3 py-1 text-[11px] text-text-muted">
            app.bloomlite.com/dashboard
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="flex flex-col gap-4 p-5">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1b1c4a] to-card p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/30 blur-2xl" />
            <span className="text-xs text-text-muted">Your Bloom Wallet</span>
            <div className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
              ¥150,000
            </div>
            <span className="text-xs text-text-muted">Available balance · JPY</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-card-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-text-primary">¥150,000</span>
              <ArrowRight className="h-4 w-4 text-brand" />
              <span className="font-semibold text-success">₦1,529,000</span>
            </div>
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              Send
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {["Sent abroad", "Sent abroad"].map((label, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-1 py-1.5"
              >
                <span className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-brand">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  {label}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  −¥{i === 0 ? "50,000" : "20,000"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      id="top"
      className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#141432] to-[#0f0f1a]"
    >
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-card-border/60 bg-background/70 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="#top" className="flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-brand" />
            <span className="text-lg font-semibold text-text-primary">Bloom Lite</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand/15 blur-[140px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="relative z-10 flex flex-col items-start">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-3 py-1.5 text-xs text-text-muted backdrop-blur">
              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                New
              </span>
              Now live for senders in Japan
            </span>
            <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
              Send money home with confidence
            </h1>
            <p className="mt-5 max-w-md text-lg text-text-muted">
              Track your balance, lock in great rates, and send money to family
              abroad effortlessly — all in one beautifully simple experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-brand" /> Japan → worldwide
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-brand" /> ~2s delivery
              </span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Take full control of every transfer
          </h2>
          <p className="mt-4 text-text-muted">
            A powerful money-movement experience with real-time balances,
            transparent rates, and tools that help you send smarter.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-card-border bg-card p-6 transition-colors hover:border-brand/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Loved by families across borders
          </h2>
          <p className="mt-4 text-text-muted">
            See how Bloom Lite helps people send money home — faster, cheaper,
            and with far less stress.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name + t.title}
              className="flex flex-col rounded-2xl border border-card-border bg-card p-6"
            >
              <Quote className="h-6 w-6 text-brand/60" aria-hidden />
              <figcaption className="mt-3 font-semibold text-text-primary">
                {t.title}
              </figcaption>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                {t.body}
              </blockquote>
              <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
                    {t.name[0]}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">
                      {t.name}
                    </span>
                    <span className="text-xs text-text-muted">{t.location}, Japan</span>
                  </div>
                </div>
                <Stars />
              </div>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-card-border bg-gradient-to-br from-[#1b1c4a] via-card to-card p-10 text-center md:p-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-brand/25 blur-[100px]" />
          <h2 className="relative text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Send money home. Instantly.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-text-muted">
            No fees to get started. Create your account in minutes and send your
            first transfer today.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link href="/register">
              <Button size="lg" className="px-10">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Link href="#top" className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-brand" />
            <span className="font-semibold text-text-primary">Bloom Lite</span>
          </Link>
          <p className="text-xs text-text-muted/70">
            © {new Date().getFullYear()} Bloom Lite · Powered by blockchain technology
          </p>
        </div>
      </footer>
    </div>
  );
}
