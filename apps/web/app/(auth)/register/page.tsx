"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing subscription...");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
    address: "",
    phone: "",
    gstNumber: "",
    restaurantType: "Cafe",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all account details");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }
    if (step === 2) {
      if (!formData.restaurantName || !formData.address || !formData.phone) {
        toast.error("Please fill in all restaurant details");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
      toast.error("Please enter your simulated card details");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Authorizing simulated payment...");
      
      // Simulate Stripe/Gateway processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setLoadingText("Provisioning tables & generating QR codes...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setLoadingText("Configuring menu categories & items...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        restaurantName: formData.restaurantName,
        address: formData.address,
        phone: formData.phone,
        gstNumber: formData.gstNumber || undefined,
        restaurantType: formData.restaurantType,
      };

      await api.post("/auth/register", payload);
      
      toast.success("SaaS Subscription Activated! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register restaurant");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#fcfdfc] px-4 py-12 animate-fade-in">
      {loading ? (
        <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-soft text-center animate-scale-up">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
          <h2 className="mt-6 text-xl font-bold text-ink">Setting Up Your POS</h2>
          <p className="mt-2 text-sm text-ink/50 font-medium">{loadingText}</p>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-clay">Multi-Tenant SaaS Onboarding</p>
            <h1 className="text-3xl font-black text-ink">UXITECH Restaurant OS</h1>
            <p className="text-xs text-ink/50 leading-relaxed max-w-md mx-auto font-medium">
              Activate your restaurant billing and digital table order system. Register below to create a custom workspace, or click <strong className="text-leaf">Sign In</strong> at the bottom to use pre-seeded dummy testing logins.
            </p>
          </div>

          {/* Stepper bar */}
          <div className="flex justify-between items-center px-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step === s
                        ? "bg-leaf text-white scale-110 shadow"
                        : step > s
                        ? "bg-leaf/20 text-leaf"
                        : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </span>
                  <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">
                    {s === 1 ? "Owner" : s === 2 ? "Restaurant" : "Billing"}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-leaf/30" : "bg-black/5"}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <Card className="p-6 md:p-8 border border-black/5 shadow-soft rounded-2xl hover-premium bg-white">
            <form onSubmit={handleRegister}>
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Owner Account Details</h2>
                    <p className="text-xs text-ink/45 mt-0.5">Create your main administrator login credentials.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Owner Full Name *"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Owner Email Address *"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password (Min. 6 characters) *"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-black/5">
                    <Button type="button" onClick={handleNextStep} className="inline-flex items-center gap-1.5 py-3.5">
                      Next Step <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Restaurant Profile</h2>
                    <p className="text-xs text-ink/45 mt-0.5">We will seed default dining tables for your business.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <Building className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="text"
                        name="restaurantName"
                        placeholder="Restaurant Business Name *"
                        value={formData.restaurantName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Restaurant Contact Number *"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="text"
                        name="address"
                        placeholder="Restaurant Address Details *"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="relative flex items-center">
                      <Building className="absolute left-3 h-4 w-4 text-ink/45" />
                      <select
                        name="restaurantType"
                        value={formData.restaurantType}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink appearance-none cursor-pointer"
                        required
                      >
                        <option value="Cafe">Cafe</option>
                        <option value="Fine Dining">Fine Dining Restaurant</option>
                        <option value="QSR / Fast Food">Quick Service / Fast Food (QSR)</option>
                        <option value="Bar / Pub / Club">Bar, Pub & Club</option>
                        <option value="Bakery / Dessert">Bakery & Dessert Shop</option>
                        <option value="Buffet">Buffet Restaurant</option>
                        <option value="Food Truck">Food Truck / Diner</option>
                      </select>
                      <ChevronRight className="absolute right-4 h-4 w-4 text-ink/45 rotate-90 pointer-events-none" />
                    </div>

                    <div className="relative flex items-center">
                      <FileText className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="text"
                        name="gstNumber"
                        placeholder="GST Number (Optional)"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-black/5">
                    <Button type="button" className="bg-transparent border border-black/10 text-ink hover:bg-mist py-3.5" onClick={handleBackStep}>
                      Back
                    </Button>
                    <Button type="button" onClick={handleNextStep} className="inline-flex items-center gap-1.5 py-3.5">
                      Next Step <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Simulated Subscription Checkout</h2>
                    <p className="text-xs text-ink/45 mt-0.5">Activate license plan at ₹3,999/month (14-day free trial).</p>
                  </div>

                  {/* Payment Card Visualizer */}
                  <div className="rounded-2xl bg-gradient-to-tr from-leaf to-emerald-700 p-6 text-white shadow-md relative overflow-hidden h-44 flex flex-col justify-between animate-scale-up">
                    <div className="absolute right-[-40px] bottom-[-40px] h-32 w-32 rounded-full bg-white/5"></div>
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-sm uppercase tracking-widest opacity-80">UXITECH LICENSE</span>
                      <CreditCard className="h-7 w-7 opacity-90" />
                    </div>
                    <p className="text-xl font-bold tracking-widest font-mono">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="opacity-50 uppercase tracking-widest text-[9px]">CARD OWNER</p>
                        <p className="font-bold uppercase tracking-wider">{formData.name || "YOUR NAME"}</p>
                      </div>
                      <div>
                        <p className="opacity-50 uppercase tracking-widest text-[9px]">EXPIRY</p>
                        <p className="font-bold tracking-wider">{formData.cardExpiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <CreditCard className="absolute left-3 h-4 w-4 text-ink/45" />
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Simulated Card Number (16 digits) *"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={16}
                        className="w-full rounded-xl border border-black/10 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="Expiry (MM/YY) *"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        maxLength={5}
                        className="w-full rounded-xl border border-black/10 py-3.5 px-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                      <input
                        type="password"
                        name="cardCvv"
                        placeholder="CVV *"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        maxLength={3}
                        className="w-full rounded-xl border border-black/10 py-3.5 px-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-black/5">
                    <Button type="button" className="bg-transparent border border-black/10 text-ink hover:bg-mist py-3.5" onClick={handleBackStep}>
                      Back
                    </Button>
                    <Button type="submit" className="py-3.5 min-w-32 bg-leaf hover:bg-leaf/90 shadow-md">
                      Confirm Subscription
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>

          <p className="text-center text-xs text-ink/50 pt-2">
            Already have a restaurant registered?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-bold text-leaf hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      )}
    </main>
  );
}
