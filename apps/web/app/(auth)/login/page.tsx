"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Users, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [email, setEmail] = useState("owner@uxitech.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const MOCK_DEMO_USERS: Record<string, { id: string; name: string; email: string; role: string }> = {
    "owner@uxitech.com": { id: "demo-owner-id", name: "Demo Owner", email: "owner@uxitech.com", role: "OWNER" },
    "manager@uxitech.com": { id: "demo-manager-id", name: "Demo Manager", email: "manager@uxitech.com", role: "MANAGER" },
    "cashier@uxitech.com": { id: "demo-cashier-id", name: "Demo Cashier", email: "cashier@uxitech.com", role: "CASHIER" },
    "waiter@uxitech.com": { id: "demo-waiter-id", name: "Demo Waiter", email: "waiter@uxitech.com", role: "WAITER" },
    "kitchen@uxitech.com": { id: "demo-kitchen-id", name: "Demo Kitchen", email: "kitchen@uxitech.com", role: "KITCHEN" }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.post("/auth/login", {
        email,
        password
      });
      setSession(response.data.user, response.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login API error:", err);
      
      // If password is Admin@123 and email matches a demo account, use demo fallback
      const cleanEmail = email.trim().toLowerCase();
      if (password === "Admin@123" && MOCK_DEMO_USERS[cleanEmail]) {
        const demoUser = MOCK_DEMO_USERS[cleanEmail];
        setSession(demoUser, "demo-sandbox-token");
        router.push("/dashboard");
        return;
      }

      if (!err.response) {
        setErrorMsg("API server unreachable. Use a Quick Demo Account below or Admin@123 to log in.");
      } else {
        setErrorMsg(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const demoAccounts = [
    { role: "Owner (Admin)", email: "owner@uxitech.com", desc: "Full reports & configs" },
    { role: "Cashier Settle", email: "cashier@uxitech.com", desc: "POS checkout bills" },
    { role: "Kitchen Station", email: "kitchen@uxitech.com", desc: "Prep tickets display" },
    { role: "Waiter Device", email: "waiter@uxitech.com", desc: "Table order view" }
  ];

  const handleAutofill = (accEmail: string) => {
    setEmail(accEmail);
    setPassword("Admin@123");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#fcfdfc] px-4 py-8 animate-fade-in">
      <div className="w-full max-w-md space-y-5">
        <form onSubmit={submit} className="w-full rounded-2xl border border-black/5 bg-white p-6 md:p-8 shadow-soft hover-premium">
          <div className="flex items-center gap-1.5 justify-center bg-leaf/5 text-leaf border border-leaf/10 rounded-full px-3 py-1 text-[11px] font-bold w-fit mx-auto mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sandbox Mode Active</span>
          </div>

          <h1 className="text-2xl font-black text-ink text-center">Staff Portal Login</h1>
          <p className="text-xs text-ink/50 mt-1 text-center font-medium">Access your restaurant dashboard command center.</p>
          
          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs font-semibold text-rose-600 text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 bg-white focus-within:border-leaf transition">
              <Mail className="h-4 w-4 text-ink/40" />
              <input 
                className="h-11 flex-1 outline-none text-ink text-sm bg-transparent" 
                name="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />
            </label>
            
            <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 bg-white focus-within:border-leaf transition">
              <Lock className="h-4 w-4 text-ink/40" />
              <input 
                className="h-11 flex-1 outline-none text-ink text-sm bg-transparent" 
                name="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="mt-6 w-full py-4 text-xs font-extrabold bg-leaf hover:bg-ink shadow-md rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In to Workspace"}
          </Button>
        </form>

        {/* Demo Accounts List Grid */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft space-y-3">
          <div className="flex items-center gap-2 border-b border-black/5 pb-2 text-xs font-black text-ink">
            <Users className="h-4.5 w-4.5 text-leaf" />
            <span>QUICK DEMO ACCOUNTS</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAutofill(acc.email)}
                className={`text-left p-2.5 rounded-xl border text-xs font-bold transition flex flex-col justify-between hover:border-leaf/50 hover:bg-leaf/[0.02] ${
                  email === acc.email ? "border-leaf bg-leaf/5" : "border-black/5"
                }`}
              >
                <span className="text-ink">{acc.role}</span>
                <span className="text-[9px] text-ink/40 font-medium tracking-normal mt-0.5">{acc.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold text-ink/40 bg-mist/40 p-2 rounded-lg border border-black/[0.03]">
            <KeyRound className="h-3.5 w-3.5 text-saffron flex-shrink-0" />
            <span>Password for all demo accounts is <code className="font-mono bg-white px-1 py-0.5 rounded border border-black/10">Admin@123</code></span>
          </div>
        </div>

        <p className="text-center text-xs text-ink/50 pt-2">
          Want to register a new restaurant?{" "}
          <button
            onClick={() => router.push("/register")}
            className="font-bold text-leaf hover:underline"
          >
            Register & Subscribe
          </button>
        </p>
      </div>
    </main>
  );
}
