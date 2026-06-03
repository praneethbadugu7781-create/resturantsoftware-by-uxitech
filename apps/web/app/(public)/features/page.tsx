"use client";

import { PublicShell } from "@/components/shared/public-shell";
import { Card } from "@/components/ui/card";
import { 
  QrCode, 
  ChefHat, 
  Receipt, 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Sliders,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const modules = [
    {
      icon: <QrCode className="h-5 w-5 text-leaf" />,
      title: "Self-Order QR System",
      badge: "No Installs Required",
      desc: "Assign high-resolution, secure QR codes to each physical table. Dine-in guests scan using native camera apps to view dynamic menu items, build carts, write custom cooking notes, and submit orders directly. Reduces order errors by 100%."
    },
    {
      icon: <ChefHat className="h-5 w-5 text-saffron" />,
      title: "Smart Kitchen Display System",
      badge: "KDS Console",
      desc: "Digital ticket board updates instantly when new orders are submitted. Orders are displayed chronologically in preparation queues. Chefs tap tickets to flag preparation status or mark dishes ready, notifying waitstaff in under 1 second."
    },
    {
      icon: <Receipt className="h-5 w-5 text-clay" />,
      title: "Cashier POS & Settlements",
      badge: "Billing Center",
      desc: "Manage checkout collections from a unified billing desk. Calculate service charges, custom GST percentages, discounts, and split invoices. Print clean receipt bills and download formal PDF invoices instantly."
    },
    {
      icon: <Zap className="h-5 w-5 text-leaf" />,
      title: "Instant Table Auto-Release",
      badge: "POS Integration",
      desc: "When a cashier processes a bill payment, the system immediately resets the table state to 'AVAILABLE' in real-time, clearing active carts and welcoming new guests. Ensures peak turn-rate efficiency."
    },
    {
      icon: <LayoutDashboard className="h-5 w-5 text-indigo-600" />,
      title: "Operations Management",
      badge: "Admin Suite",
      desc: "Manage your menu catalog, configure pricing, upload dish media, organize category sort-orders, and monitor active table sessions from a dashboard restricted to managers and owners."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-rose-500" />,
      title: "Live Operations Analytics",
      badge: "Reports Engine",
      desc: "Track total revenue, open orders, occupied tables, and inventory stockouts. View clean weekly revenue flow trends and dynamic menu dish popularity rankings compiled straight from actual invoices."
    }
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28 animate-slide-up text-left">
        {/* Page Header */}
        <div className="max-w-2xl space-y-4 border-b border-black/[0.04] pb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-leaf/5 border border-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-leaf uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Product Modules</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">
            Clean features for serious restaurant operations.
          </h1>
          <p className="text-sm font-medium text-ink/50 leading-relaxed max-w-xl">
            A fast, cloud-hosted POS billing, kitchen KDS queue, and table QR self-ordering workspace built to eliminate paper tickets and increase table turnover.
          </p>
        </div>

        {/* Feature Modules Grid */}
        <div className="grid gap-6 mt-16 md:grid-cols-2">
          {modules.map((m, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-2xl border border-black/[0.05] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4 hover:border-black/[0.1] hover:shadow-[0_12px_40px_rgb(0,0,0,0.025)] transition duration-300"
            >
              <div className="flex justify-between items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist/60 text-ink">
                  {m.icon}
                </div>
                <span className="text-[9px] font-bold text-ink/35 uppercase tracking-wider border border-black/[0.05] rounded-full px-2.5 py-0.5 bg-mist/20">
                  {m.badge}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-ink">{m.title}</h3>
                <p className="text-xs text-ink/45 font-medium leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-20 rounded-3xl border border-black/[0.05] bg-white p-8 md:p-12 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-left">
            <h3 className="text-xl font-bold text-ink flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-leaf" />
              Ready to test in Sandbox?
            </h3>
            <p className="text-xs font-semibold text-ink/40 max-w-md leading-relaxed">
              Sign up today and get an instantly provisioned workspace populated with 10 tables, default categories, and dynamic ordering menus.
            </p>
          </div>
          <Link 
            href="/register" 
            className="rounded-xl bg-leaf px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-ink hover:scale-[1.01] active:scale-[0.99] transition"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
