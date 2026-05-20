import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Welcome to LiveCafe",
  description: "LiveCafe - Next-Generation Multi-Floor Point of Sale & Self-Service Platform",
}

const features = [
  {
    icon: ShoppingCart,
    title: "Fast Checkout",
    description:
      "Process sales in seconds with an intuitive interface built for speed.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track revenue, top products, and trends from a live dashboard.",
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Stay on top of stock levels with automatic low-stock alerts.",
  },
  {
    icon: Users,
    title: "Customer Profiles",
    description:
      "Build loyalty by tracking purchase history and preferences.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimised for performance — no lag, even during peak hours.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security with 99.9% uptime guaranteed.",
  },
]

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small shops",
    features: ["1 register", "Basic analytics", "Email support", "500 products"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    description: "For growing businesses",
    features: [
      "5 registers",
      "Advanced analytics",
      "Priority support",
      "Unlimited products",
      "Customer profiles",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large operations",
    features: [
      "Unlimited registers",
      "Custom reporting",
      "Dedicated support",
      "API access",
      "Multi-location",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 bg-linear-to-b from-zinc-50 to-white">
        <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-sm">
          <TrendingUp className="size-3.5" />
          Trusted by 10,000+ businesses
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl leading-tight">
          The modern POS for{" "}
          <span className="text-black underline decoration-wavy decoration-zinc-300">
            every store
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-500 leading-relaxed">
          Live Cafe helps you sell faster, manage smarter, and grow your
          business — all from one simple platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="rounded-xl px-8 gap-2">
              Start for free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="rounded-xl px-8">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          No credit card required · 14-day free trial
        </p>
      </section>

      {/* Features */}
      <section className="px-4 py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Everything you need to run your store
            </h2>
            <p className="mt-3 text-zinc-500 text-base max-w-lg mx-auto">
              From the counter to the back office, Live Cafe has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100">
                  <f.icon className="size-5 text-zinc-700" />
                </div>
                <h3 className="font-semibold text-zinc-900">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 md:py-28 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-zinc-500 text-base">
              Pick a plan that fits your business. Upgrade anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col gap-6 rounded-2xl p-8 border ${plan.highlighted
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-200"
                  }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${plan.highlighted ? "text-zinc-400" : "text-zinc-500"
                      }`}
                  >
                    {plan.name}
                  </p>
                  <p
                    className={`mt-1 text-4xl font-bold ${plan.highlighted ? "text-white" : "text-zinc-900"
                      }`}
                  >
                    {plan.price}
                    {plan.price !== "Custom" && (
                      <span
                        className={`text-base font-normal ${plan.highlighted ? "text-zinc-400" : "text-zinc-400"
                          }`}
                      >
                        /mo
                      </span>
                    )}
                  </p>
                  <p
                    className={`mt-1 text-sm ${plan.highlighted ? "text-zinc-400" : "text-zinc-500"
                      }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`size-4 shrink-0 ${plan.highlighted ? "text-zinc-300" : "text-zinc-500"
                          }`}
                      />
                      <span
                        className={
                          plan.highlighted ? "text-zinc-200" : "text-zinc-600"
                        }
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="mt-auto">
                  <Button
                    className="w-full rounded-xl"
                    variant={plan.highlighted ? "secondary" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:py-28 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="mt-4 text-zinc-400 text-base">
            Join thousands of cafes already using Live Cafe.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="rounded-xl px-8 gap-2">
                Create free account
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8 w-auto object-contain rounded-md" alt="Live Cafe Logo" />
            <span className="font-bold text-zinc-800">Live Cafe</span>
          </div>
          <p>© {new Date().getFullYear()} Live Cafe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
