import { PublicShell } from "@/components/shared/public-shell";
import { Card } from "@/components/ui/card";
import { Sparkles, Compass, Shield, Target } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Compass className="h-5 w-5 text-leaf" />,
      title: "Reliability First",
      desc: "Our platform is built on fully resilient Prisma & MongoDB Atlas databases to guarantee 99.99% uptime during peak dinner service rushes."
    },
    {
      icon: <Shield className="h-5 w-5 text-saffron" />,
      title: "Secure Isolation",
      desc: "Isolated data tenancy configurations ensure that each restaurant's menus, logs, invoice audits, and cashier files are strictly secure."
    },
    {
      icon: <Target className="h-5 w-5 text-clay" />,
      title: "Zero-Latency Sync",
      desc: "Utilizes real-time socket listeners to push orders to kitchen display terminals and cashier POS panels in under 3 seconds."
    }
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28 animate-slide-up text-left">
        {/* Title */}
        <div className="max-w-2xl space-y-4 border-b border-black/[0.04] pb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-leaf/5 border border-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-leaf uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Our Company</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">
            Built for modern dine-in operations.
          </h1>
          <p className="text-sm font-medium text-ink/50 leading-relaxed max-w-xl">
            UXITECH Restaurant Software was founded to solve a single problem: traditional POS systems are slow, complex, and require expensive hardware installations. We build cloud-first, dynamic software that runs on any device.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid gap-6 mt-16 md:grid-cols-3">
          {values.map((v, idx) => (
            <div key={idx} className="p-5 border border-black/[0.04] bg-white rounded-2xl shadow-soft space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist/60 text-ink">
                {v.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-ink">{v.title}</h3>
                <p className="text-[11px] font-semibold text-ink/45 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Company milestones */}
        <div className="mt-20 border-t border-black/[0.04] pt-16 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-lg font-black text-ink">Architecture Focus</h3>
            <p className="text-xs font-semibold text-ink/40 leading-relaxed">
              We leverage next-gen technologies to build a robust, highly extensible SaaS stack.
            </p>
          </div>
          <div className="md:col-span-8 space-y-4 text-xs font-semibold text-ink/65 leading-relaxed">
            <p>
              Our software replaces traditional, heavy local databases with a global MongoDB Atlas setup, connecting active guest QR sessions straight to the cashier's desk. This eliminates double-punching, menu discrepancies, and wait time bottlenecks.
            </p>
            <p>
              Whether you run a single neighborhood cafe or a multi-branch dine-in brand, UXITECH scales seamlessly to handle your table layouts, inventory stock alerts, reservation booking slots, and tax invoicing logs.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
