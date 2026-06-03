"use client";

import { useState } from "react";
import { PublicShell } from "@/components/shared/public-shell";
import { Card } from "@/components/ui/card";
import { 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck 
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const planFeatures = [
    "Unlimited table configurations",
    "Encrypted table QR code generation",
    "Dynamic customer self-ordering menu & carts",
    "Kitchen Display System (KDS) prep console",
    "Cashier POS invoice checkout",
    "Staff attendance & role credentials",
    "Weekly revenue charts & data insights"
  ];

  const faqs = [
    {
      q: "How does the Multi-Tenant SaaS platform work?",
      a: "When a new restaurant owner signs up at UXITECH, our system creates an isolated database workspace. Default menu items, categories, and 10 digital tables with unique QR identifiers are automatically seeded so you can start testing immediately."
    },
    {
      q: "Do I need dedicated or expensive hardware?",
      a: "No! UXITECH runs entirely in the cloud on web browsers. Chefs can use any iPad/tablet or smart TV as a KDS, cashiers can use a standard laptop or PC, and customers order directly from their own smartphones."
    },
    {
      q: "How does the table auto-release system operate?",
      a: "Our core POS integration links customer QR carts directly to tables. When a customer finishes eating and requests the bill, the cashier completes the payment checkout. The system immediately resets that table state to 'AVAILABLE' and empties its active cart."
    },
    {
      q: "Is there a free trial, and can I cancel anytime?",
      a: "Yes! Every subscription comes with a 14-day fully featured free trial. You can test out all user roles, register custom dishes, and print QR codes. You can cancel or modify your plan from your billing dashboard anytime."
    },
    {
      q: "Can customers submit multiple rounds of orders?",
      a: "Absolutely. Customers can scan the table QR code multiple times to order starters, main courses, and desserts. All items are appended to the table's running bill in real-time until checkout."
    }
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28 animate-slide-up text-left">
        {/* Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto border-b border-black/[0.04] pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">SaaS Licensing</p>
          <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">
            Simple plan. Complete features.
          </h1>
          <p className="text-sm font-medium text-ink/50 leading-relaxed">
            All tools—QR self-ordering, KDS queues, billing POS, and tables analytics—are bundled into one transparent subscription.
          </p>

          {/* Cycle Toggle */}
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-mist/60 p-1 border border-black/[0.04] mt-6">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${billingCycle === "monthly" ? "bg-white text-ink shadow-sm" : "text-ink/40"}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${billingCycle === "yearly" ? "bg-white text-ink shadow-sm" : "text-ink/40"}`}
            >
              Yearly (20% Save)
            </button>
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="grid gap-8 mt-16 md:grid-cols-12 md:items-stretch max-w-3xl mx-auto">
          {/* Pro Card */}
          <div className="md:col-span-6 rounded-2xl border border-black/[0.05] bg-white shadow-soft overflow-hidden flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-leaf uppercase tracking-wider bg-leaf/5 border border-leaf/10 rounded px-2 py-0.5 w-fit">
                    Full Platform
                  </p>
                  <h3 className="mt-2 text-lg font-black text-ink">UXITECH Pro OS</h3>
                </div>
                <span className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">
                  14-Day Trial
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2 border-t border-black/[0.04]">
                <span className="text-4xl font-black text-ink">
                  {billingCycle === "monthly" ? "₹3,999" : "₹3,199"}
                </span>
                <span className="text-xs font-bold text-ink/40">/ month</span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-[9px] font-bold text-leaf">Billed annually (₹38,388 / year)</p>
              )}
              <p className="text-xs text-ink/45 font-medium leading-relaxed">
                Automated table session provisioning, live orders tracking, and cashier POS settlements workspace.
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <Link 
                href="/register" 
                className="block text-center w-full bg-leaf text-white font-bold py-3 rounded-lg hover:bg-ink shadow-sm hover:scale-[1.01] active:scale-[0.99] transition text-xs"
              >
                Start Free Trial
              </Link>
              <div className="flex justify-center items-center gap-1.5 text-[9px] font-bold text-ink/40">
                <ShieldCheck className="h-4 w-4 text-leaf" />
                <span>Simulated Sandbox Gateway Checkout</span>
              </div>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="md:col-span-6 rounded-2xl border border-black/[0.05] bg-white p-6 shadow-soft flex flex-col justify-center space-y-4">
            <h4 className="text-xs font-bold text-ink/65 uppercase tracking-wider">Features Checklist</h4>
            <ul className="space-y-3 text-xs text-ink/65 font-bold">
              {planFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-4.5 w-4.5 text-leaf bg-leaf/10 p-0.5 rounded-full flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-28 max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-black tracking-tight text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-ink/45 font-medium">
              Review operational queries, setup guidelines, and billing parameters.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-xl border border-black/[0.04] bg-[#fdfdfd] overflow-hidden"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-4 text-left font-bold text-xs sm:text-sm text-ink hover:bg-mist/35 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-leaf flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-ink/45 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>

                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-ink/50 font-semibold border-t border-black/[0.02] bg-white animate-fade-in">
                    <p className="leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
