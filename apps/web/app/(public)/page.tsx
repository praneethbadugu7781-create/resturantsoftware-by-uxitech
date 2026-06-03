"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  QrCode, 
  ChefHat, 
  Receipt, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { PublicShell } from "@/components/shared/public-shell";

export default function HomePage() {
  const [activeMockupTab, setActiveMockupTab] = useState<"customer" | "kds" | "cashier">("customer");

  const clients = [
    "Dosa Factory", "Tandoori Grill", "Spice Palace", "Royal Biryani", "Mumbai Masala"
  ];

  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36 border-b border-black/[0.03]">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-leaf/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-saffron/5 blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7 text-left animate-slide-up">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-leaf/15 bg-leaf/5 px-2.5 py-0.5 text-[10px] font-bold text-leaf uppercase tracking-wider">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Next-Gen Cloud Restaurant System</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl lg:leading-[1.08]">
                The operating system for modern dine-in restaurants.
              </h1>
              <p className="text-sm font-medium text-ink/50 leading-relaxed max-w-xl">
                Digitalize your table operations with self-scan QR ordering, real-time Kitchen Display Systems (KDS), and cloud cashier billing panels. Provision your restaurant workspace in 5 minutes.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-ink hover:scale-[1.01] active:scale-[0.99]"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link 
                  href="/how-it-works" 
                  className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-5 py-3 text-xs font-bold text-ink transition hover:bg-mist"
                >
                  See How It Works
                </Link>
              </div>

              {/* Stats banner */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-black/[0.05] max-w-md text-xs font-bold text-ink/40 tracking-wider">
                <div>
                  <p className="text-xl font-black text-leaf">100%</p>
                  <p className="uppercase text-[9px] mt-0.5">Cloud Hosted</p>
                </div>
                <div>
                  <p className="text-xl font-black text-clay">&lt; 3 Secs</p>
                  <p className="uppercase text-[9px] mt-0.5">Real-Time Sync</p>
                </div>
                <div>
                  <p className="text-xl font-black text-saffron">0 min</p>
                  <p className="uppercase text-[9px] mt-0.5">Hardware Needed</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Dashboard */}
            <div className="lg:col-span-5 animate-scale-up">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-soft">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-black/10"></span>
                    <span className="h-2 w-2 rounded-full bg-black/10"></span>
                    <span className="h-2 w-2 rounded-full bg-black/10"></span>
                    <span className="ml-2 text-[9px] font-bold text-ink/35 tracking-wider font-mono">WORKSPACE INTERFACE</span>
                  </div>
                  <div className="flex rounded-lg bg-mist/50 p-0.5 border border-black/[0.03]">
                    <button 
                      onClick={() => setActiveMockupTab("customer")} 
                      className={`rounded px-2 py-1 text-[9px] font-bold transition-all ${activeMockupTab === "customer" ? "bg-white text-leaf shadow-sm" : "text-ink/40"}`}
                    >
                      Customer QR
                    </button>
                    <button 
                      onClick={() => setActiveMockupTab("kds")} 
                      className={`rounded px-2 py-1 text-[9px] font-bold transition-all ${activeMockupTab === "kds" ? "bg-white text-saffron shadow-sm" : "text-ink/40"}`}
                    >
                      KDS Board
                    </button>
                    <button 
                      onClick={() => setActiveMockupTab("cashier")} 
                      className={`rounded px-2 py-1 text-[9px] font-bold transition-all ${activeMockupTab === "cashier" ? "bg-white text-clay shadow-sm" : "text-ink/40"}`}
                    >
                      POS Billing
                    </button>
                  </div>
                </div>

                {/* Mockup Workspace Screen */}
                <div className="mt-4 min-h-[280px] bg-[#fcfdfc] rounded-xl border border-black/[0.04] p-4 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* TAB 1: Customer QR self-ordering */}
                  {activeMockupTab === "customer" && (
                    <div className="space-y-3 text-left w-full">
                      <div className="flex justify-between items-center bg-leaf/5 border border-leaf/10 rounded-lg p-2 text-[10px] text-leaf font-bold">
                        <span>📍 Table 04 Digital Menu</span>
                        <span className="bg-leaf text-white px-2 py-0.5 rounded text-[8px]">ACTIVE CART</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center rounded-lg border border-black/[0.04] bg-white p-2 shadow-sm text-xs font-semibold">
                          <div>
                            <p className="text-ink">Chicken Biryani</p>
                            <p className="text-[9px] text-ink/35">Slow-cooked basmati</p>
                          </div>
                          <span className="text-[10px] text-leaf bg-leaf/5 px-2 py-0.5 rounded">2 x ₹290</span>
                        </div>

                        <div className="flex justify-between items-center rounded-lg border border-black/[0.04] bg-white p-2 shadow-sm text-xs font-semibold">
                          <div>
                            <p className="text-ink">Fresh Lime Soda</p>
                            <p className="text-[9px] text-ink/35">Sparkling citrus</p>
                          </div>
                          <span className="text-[10px] text-leaf bg-leaf/5 px-2 py-0.5 rounded">1 x ₹90</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black/[0.04] space-y-2">
                        <div className="flex justify-between text-xs font-bold text-ink">
                          <span>Total Amount</span>
                          <span className="text-leaf">₹670</span>
                        </div>
                        <button className="w-full bg-leaf text-white text-[10px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 shadow-sm">
                          Send Order to Kitchen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Kitchen KDS Board */}
                  {activeMockupTab === "kds" && (
                    <div className="space-y-3 text-left w-full">
                      <div className="flex justify-between items-center border-b border-black/[0.04] pb-2">
                        <h4 className="text-[10px] font-bold text-ink flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-pulse" />
                          Kitchen Display Queue
                        </h4>
                        <span className="text-[8px] font-bold text-ink/35 uppercase tracking-wider">Active Tickets</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-saffron/15 bg-saffron/[0.02] p-2 space-y-1.5">
                          <div className="flex justify-between text-[8px] font-bold">
                            <span className="text-saffron">TICKET #104</span>
                            <span className="text-ink/40">T-04</span>
                          </div>
                          <div className="font-mono text-[9px] text-ink/75 font-semibold leading-relaxed">
                            <p>• 2x Chicken Biryani</p>
                            <p>• 1x Lime Soda</p>
                          </div>
                          <button className="w-full bg-saffron/10 text-saffron text-[8px] font-bold py-1 rounded">
                            Mark Ready
                          </button>
                        </div>

                        <div className="rounded-lg border border-leaf/15 bg-leaf/[0.02] p-2 space-y-1.5 opacity-70">
                          <div className="flex justify-between text-[8px] font-bold">
                            <span className="text-leaf">READY #103</span>
                            <span className="text-ink/40">T-02</span>
                          </div>
                          <div className="font-mono text-[9px] text-ink/40 line-through">
                            <p>• 1x Paneer Tikka</p>
                            <p>• 2x Lime Soda</p>
                          </div>
                          <div className="w-full bg-leaf/10 text-leaf text-center text-[8px] font-bold py-1 rounded">
                            Served
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Cashier POS */}
                  {activeMockupTab === "cashier" && (
                    <div className="space-y-3 text-left w-full">
                      <div className="flex justify-between items-center bg-clay/5 border border-clay/10 rounded-lg p-2 text-[10px] text-clay font-bold">
                        <span>💳 Cashier Billing Terminal</span>
                        <span className="text-[8px] bg-clay text-white px-2 py-0.5 rounded">SETTLE BILL</span>
                      </div>

                      <div className="rounded-lg border border-black/[0.04] bg-white p-3 space-y-2 shadow-sm text-[11px] font-semibold">
                        <div className="flex justify-between text-ink/50 border-b border-black/[0.04] pb-1.5">
                          <span>TABLE 04 SUMMARY</span>
                          <span>ORDER #104</span>
                        </div>
                        <div className="space-y-1 text-ink/70">
                          <div className="flex justify-between">
                            <span>Chicken Biryani (x2)</span>
                            <span className="font-mono">₹580.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fresh Lime Soda (x1)</span>
                            <span className="font-mono">₹90.00</span>
                          </div>
                        </div>
                        <div className="flex justify-between font-bold text-ink border-t border-black/[0.04] pt-1.5">
                          <span>Total + Tax</span>
                          <span className="text-clay">₹703.50</span>
                        </div>
                      </div>

                      <button className="w-full bg-clay text-white text-[10px] font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1">
                        Settle & Release Table 04
                      </button>
                    </div>
                  )}

                  {/* Floating Notification */}
                  <div className="absolute bottom-2 right-2 left-2 bg-ink text-white rounded-lg p-1.5 shadow-md flex items-center gap-2 text-[9px] font-bold border border-white/5 animate-fade-in animate-slide-up">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                    <span className="flex-1 text-white/80">Table 04 checked out. Status reset to AVAILABLE.</span>
                    <span className="text-leaf uppercase text-[8px]">Live</span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[9px] font-bold text-ink/30 tracking-wider">TAP PREVIEW MODULES TO SEE LIVE WORKFLOW</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof / Clients logos */}
      <section className="py-10 border-b border-black/[0.03] bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-[9px] font-bold uppercase tracking-widest text-ink/35">Trusted by local Indian culinary brands</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 mt-6 text-sm font-bold text-ink/35">
            {clients.map((c) => (
              <span key={c} className="hover:text-ink/60 transition cursor-default tracking-wide font-extrabold">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Pillars / Features Overview */}
      <section className="py-20 md:py-28 bg-[#fcfdfc] border-b border-black/[0.03]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-12 md:items-center">
            <div className="md:col-span-4 space-y-4 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-clay">Unified Ecosystem</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl leading-tight">
                Designed to optimize the customer loop.
              </h2>
              <p className="text-xs font-semibold text-ink/45 leading-relaxed">
                We remove operational friction between tables, kitchens, and billing. View the complete feature catalog to see all operational modes.
              </p>
              <div className="pt-2">
                <Link 
                  href="/features" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:underline"
                >
                  Explore all features <ArrowUpRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: <QrCode className="h-4.5 w-4.5 text-leaf" />,
                    title: "QR Table Orders",
                    desc: "Guests scan QR codes, build carts, and submit orders directly to KDS."
                  },
                  {
                    icon: <ChefHat className="h-4.5 w-4.5 text-saffron" />,
                    title: "Real-time KDS",
                    desc: "Digital display lists inbound orders chronologically. No print lags."
                  },
                  {
                    icon: <Receipt className="h-4.5 w-4.5 text-clay" />,
                    title: "POS Settle",
                    desc: "Calculate taxes, GST, discounts, split bills, and release tables instantly."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-black/[0.04] bg-white space-y-3 shadow-[0_4px_20px_rgb(0,0,0,0.005)] text-left hover:border-black/[0.08] transition">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mist/60">
                      {item.icon}
                    </div>
                    <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-ink/45 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Overview */}
      <section className="py-20 md:py-28 bg-white border-b border-black/[0.03]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-12 md:items-center">
            
            <div className="md:col-span-7 grid gap-3 sm:grid-cols-2 text-left order-2 md:order-1">
              {[
                ["01", "Register Profile", "Activate sandbox workspace on the cloud."],
                ["02", "Generate QRs", "Encrypted codes provisioned automatically."],
                ["03", "Guest self-order", "Mobile ordering synced straight to KDS."],
                ["04", "Cashier settle", "POS invoice collection & table reset."]
              ].map(([num, title, desc], idx) => (
                <div key={idx} className="p-4 border border-black/[0.04] rounded-xl space-y-1 bg-[#fdfdfd]">
                  <span className="text-[10px] font-bold text-leaf bg-leaf/5 px-2 py-0.5 rounded-md">{num}</span>
                  <h4 className="font-bold text-ink text-xs pt-1.5">{title}</h4>
                  <p className="text-[10px] font-semibold text-ink/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="md:col-span-5 space-y-4 text-left order-1 md:order-2">
              <p className="text-xs font-bold uppercase tracking-widest text-saffron">Step-by-step pipeline</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl leading-tight">
                Simple, automated setup.
              </h2>
              <p className="text-xs font-semibold text-ink/45 leading-relaxed">
                Our database seeds defaults instantly upon simulated payment. Read the complete step-by-step onboarding walkthrough guide for more details.
              </p>
              <div className="pt-2">
                <Link 
                  href="/how-it-works" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:underline"
                >
                  Read the onboarding guide <ArrowUpRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-leaf text-white py-20 relative overflow-hidden text-center">
        <div className="absolute left-[-5%] top-[-20%] h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-[-5%] bottom-[-20%] h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="mx-auto max-w-4xl px-6 space-y-6 relative z-10">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Upgrade your restaurant workspace.
          </h2>
          <p className="text-white/80 max-w-md mx-auto text-xs font-semibold leading-relaxed">
            Create an administrator profile today, complete simulated payment checkout, and activate your SaaS license with a 14-day free trial.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link 
              href="/register" 
              className="rounded-lg bg-white px-5 py-3 text-xs font-bold text-leaf shadow-md transition hover:bg-ink hover:text-white hover:scale-[1.01] active:scale-[0.99]"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing" 
              className="rounded-lg border border-white/20 bg-transparent px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
            >
              View License Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white py-12 border-t border-white/5 text-[11px] font-medium text-left">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-leaf text-white">
                <QrCode className="h-4 w-4" />
              </div>
              <span>UXITECH OS</span>
            </div>
            <p className="text-white/40 leading-relaxed max-w-xs font-semibold">
              Modern table management, automated KDS display ticketing, and cashier POS settlements workspace.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white/95 uppercase tracking-wider mb-4 text-[9px]">Product</h4>
            <ul className="space-y-2 text-white/50 font-semibold">
              <li><Link href="/features" className="hover:text-white">Features Catalog</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">Onboarding Guide</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing Plans</Link></li>
              <li><Link href="/register" className="hover:text-white">SaaS Registration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white/95 uppercase tracking-wider mb-4 text-[9px]">SaaS System</h4>
            <ul className="space-y-2 text-white/50 font-semibold">
              <li><Link href="/login" className="hover:text-white">Admin Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white">Cashier POS Desk</Link></li>
              <li><Link href="/login" className="hover:text-white">Kitchen Display</Link></li>
              <li><Link href="/login" className="hover:text-white">Waiter Mobile Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white/95 uppercase tracking-wider mb-4 text-[9px]">Company</h4>
            <p className="text-white/40 leading-relaxed font-semibold">
              MongoDB database clusters, secure isolated multitenancy, and optimized Next.js static asset routing.
            </p>
            <p className="text-white/60 mt-3 font-bold">
              © {new Date().getFullYear()} UXITECH Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </PublicShell>
  );
}
