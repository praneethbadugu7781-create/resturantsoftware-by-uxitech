"use client";

import { PublicShell } from "@/components/shared/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Inquiry submitted! Our representative will call you shortly.");
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28 animate-slide-up text-left">
        <div className="grid gap-12 md:grid-cols-12 md:items-start">
          
          {/* Left Channel Details */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-leaf/5 border border-leaf/10 px-2.5 py-0.5 text-[10px] font-bold text-leaf uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>Get in Touch</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-ink md:text-4xl">
                Let's talk about your restaurant.
              </h1>
              <p className="text-xs font-semibold text-ink/45 leading-relaxed max-w-sm">
                Connect with our team to inquire about custom setups, specialized integrations, or enterprise pricing tiers.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-black/[0.04] text-xs font-bold text-ink/65">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist/60 text-ink">
                  <Mail className="h-4.5 w-4.5 text-leaf" />
                </div>
                <div>
                  <p className="text-[10px] text-ink/35 uppercase tracking-wider">EMAIL SUPPORT</p>
                  <p className="mt-0.5">hello@uxitech.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist/60 text-ink">
                  <Phone className="h-4.5 w-4.5 text-saffron" />
                </div>
                <div>
                  <p className="text-[10px] text-ink/35 uppercase tracking-wider">PHONE ENQUIRIES</p>
                  <p className="mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist/60 text-ink">
                  <MapPin className="h-4.5 w-4.5 text-clay" />
                </div>
                <div>
                  <p className="text-[10px] text-ink/35 uppercase tracking-wider">HEAD OFFICE</p>
                  <p className="mt-0.5">MG Road, Bengaluru, Karnataka</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right inquiry form */}
          <div className="md:col-span-7">
            <Card className="p-6 md:p-8 border border-black/[0.05] bg-white shadow-soft rounded-3xl">
              <h2 className="text-lg font-black text-ink">Send an Inquiry</h2>
              <p className="text-[10px] font-bold text-ink/40 uppercase mt-0.5">REPRESENTATIVE CALL BACK</p>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">Full Name</span>
                    <input 
                      type="text" 
                      required 
                      className="rounded-xl border border-black/10 px-4 py-3 text-xs outline-none focus:border-leaf bg-white text-ink font-semibold" 
                      placeholder="e.g. Rahul Sharma" 
                    />
                  </label>
                  
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">Restaurant Name</span>
                    <input 
                      type="text" 
                      required 
                      className="rounded-xl border border-black/10 px-4 py-3 text-xs outline-none focus:border-leaf bg-white text-ink font-semibold" 
                      placeholder="e.g. Spice Diner" 
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">Work Email</span>
                    <input 
                      type="email" 
                      required 
                      className="rounded-xl border border-black/10 px-4 py-3 text-xs outline-none focus:border-leaf bg-white text-ink font-semibold" 
                      placeholder="e.g. rahul@spicediner.in" 
                    />
                  </label>
                  
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">Mobile Number</span>
                    <input 
                      type="tel" 
                      required 
                      className="rounded-xl border border-black/10 px-4 py-3 text-xs outline-none focus:border-leaf bg-white text-ink font-semibold" 
                      placeholder="e.g. +91 99000 00000" 
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider">Operational Requirements</span>
                  <textarea 
                    rows={4} 
                    required 
                    className="rounded-xl border border-black/10 px-4 py-3 text-xs outline-none focus:border-leaf bg-white text-ink font-semibold resize-none" 
                    placeholder="Briefly describe your requirements (e.g. number of tables, branches)..." 
                  />
                </label>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 text-xs font-bold bg-leaf hover:bg-ink shadow-sm rounded-xl transition"
                >
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </Button>
                
                <div className="flex justify-center items-center gap-1.5 text-[9px] font-bold text-ink/40 pt-1 border-t border-black/[0.04]">
                  <ShieldCheck className="h-4 w-4 text-leaf" />
                  <span>Secure MongoDB client encryption.</span>
                </div>
              </form>
            </Card>
          </div>

        </div>
      </section>
    </PublicShell>
  );
}
