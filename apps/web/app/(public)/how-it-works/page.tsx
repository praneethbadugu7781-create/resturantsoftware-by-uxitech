"use client";

import { PublicShell } from "@/components/shared/public-shell";
import { Card } from "@/components/ui/card";
import { 
  UserPlus, 
  QrCode, 
  Smartphone, 
  Receipt,
  Check,
  Play
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      icon: <UserPlus className="h-5 w-5 text-leaf" />,
      title: "Workspace Registration & License Activation",
      desc: "Fill in your account details and restaurant profile (business name, address, phone). Confirm your simulated $49 subscription license using our sandbox payment gateway. This instantly provisions your restaurant workspace on the cloud.",
      checklist: [
        "Unique sandbox database setup",
        "E-mail administrator role provisioned",
        "Simulated 14-day trial activated"
      ]
    },
    {
      step: "02",
      icon: <QrCode className="h-5 w-5 text-saffron" />,
      title: "Instant Table QR Generation",
      desc: "Our database automatically seeds 10 physical tables mapped with unique, encrypted QR tokens. These tokens point to your custom dine-in ordering link. You can view, download, or print these QR codes immediately from your Table configuration panel.",
      checklist: [
        "Pre-seeded area layouts (AC & Family Zone)",
        "Secure table token association",
        "Printable QR code URLs"
      ]
    },
    {
      step: "03",
      icon: <Smartphone className="h-5 w-5 text-clay" />,
      title: "Guest Scan & Self-Ordering Cart",
      desc: "When customers are seated, they scan the table QR code with their mobile cameras. This opens a dynamic digital menu synced directly to your inventory. Guests add items, write cooking specifications, and place orders without waiting for a waiter.",
      checklist: [
        "Zero mobile app installation required",
        "Real-time item status notifications",
        "Cart totals calculated automatically"
      ]
    },
    {
      step: "04",
      icon: <Receipt className="h-5 w-5 text-leaf" />,
      title: "Cashier Settlement & Auto-Release",
      desc: "Once dining concludes, the cashier reviews the table's running bill in the POS panel. The cashier selects the payment method (Cash, Card, UPI) and completes checkout. The system prints the invoice and instantly updates the table back to 'AVAILABLE' in real-time.",
      checklist: [
        "Real-time checkout socket alerts",
        "Automatic table status reset to AVAILABLE",
        "Printable PDF tax invoice generation"
      ]
    }
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28 animate-slide-up text-left">
        {/* Title */}
        <div className="max-w-xl space-y-4 border-b border-black/[0.04] pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">Onboarding Walkthrough</p>
          <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">
            How UXITECH Digitalizes Your Tables.
          </h1>
          <p className="text-sm font-medium text-ink/50 leading-relaxed">
            Follow this clear step-by-step pipeline to understand how the multi-tenant SaaS platform synchronizes customers, kitchens, and cashiers in real-time.
          </p>
        </div>

        {/* Timeline Timeline */}
        <div className="mt-16 space-y-16 relative">
          {/* Vertical progress line */}
          <div className="hidden md:block absolute left-[30px] top-6 bottom-6 w-0.5 bg-black/[0.05] z-0" />
          
          {steps.map((st, idx) => (
            <div key={idx} className="relative z-10 flex flex-col md:flex-row gap-8">
              {/* Step indicator circle */}
              <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fcfdfc] border border-black/[0.06] text-ink shadow-[0_4px_20px_rgb(0,0,0,0.01)] md:h-16 md:w-16">
                {st.icon}
              </div>

              {/* Step Content */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-leaf bg-leaf/5 border border-leaf/10 px-2 py-0.5 rounded-md">
                    STEP {st.step}
                  </span>
                  <h3 className="text-lg font-black text-ink">{st.title}</h3>
                </div>
                <p className="text-xs font-medium text-ink/50 leading-relaxed max-w-2xl">{st.desc}</p>
                
                {/* Feature checklist */}
                <ul className="grid gap-2 text-xs text-ink/65 font-bold pt-2 sm:grid-cols-3">
                  {st.checklist.map((item, cidx) => (
                    <li key={cidx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-leaf bg-leaf/10 p-0.5 rounded-full flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center space-y-5 bg-mist/30 border border-black/[0.04] p-8 md:p-12 rounded-3xl">
          <h3 className="text-xl font-bold text-ink">Ready to run a live sandbox order?</h3>
          <p className="text-xs font-medium text-ink/50 max-w-sm mx-auto leading-relaxed">
            Create a custom business profile, complete simulated payment, and print table QR codes instantly.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link 
              href="/register" 
              className="rounded-xl bg-leaf px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-ink hover:scale-[1.01] active:scale-[0.99] transition"
            >
              Sign Up & Get Started
            </Link>
            <Link 
              href="/login" 
              className="rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-bold text-ink hover:bg-mist transition"
            >
              Try Pre-seeded Demo
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
