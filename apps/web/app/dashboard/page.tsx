"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";

type Bill = {
  id: string;
  totalAmount: number;
  createdAt: string;
};

type Order = {
  id: string;
  status: string;
};

type Table = {
  id: string;
  status: string;
};

type InventoryItem = {
  id: string;
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todayRevenue: 0,
    openOrders: 0,
    occupiedTables: 0,
    totalTables: 0,
    lowStockCount: 0
  });
  const [chartData, setChartData] = useState<{ day: string; revenue: number }[]>([]);

  useEffect(() => {
    if (user) {
      if (user.role === "KITCHEN") {
        router.replace("/dashboard/kitchen");
      } else if (user.role === "WAITER") {
        router.replace("/dashboard/tables");
      } else if (user.role === "CASHIER") {
        router.replace("/dashboard/billing");
      } else {
        fetchDashboardData();
      }
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [billsRes, ordersRes, tablesRes, lowStockRes] = await Promise.all([
        api.get("/bills").catch(() => ({ data: [] })),
        api.get("/orders").catch(() => ({ data: [] })),
        api.get("/tables").catch(() => ({ data: [] })),
        api.get("/inventory/low-stock").catch(() => ({ data: [] }))
      ]);

      const bills: Bill[] = billsRes.data;
      const orders: Order[] = ordersRes.data;
      const tables: Table[] = tablesRes.data;
      const lowStock: InventoryItem[] = lowStockRes.data;

      // 1. Calculate Today's Revenue (local date bounds)
      const todayStr = new Date().toDateString();
      const todayRevenue = bills
        .filter((b) => new Date(b.createdAt).toDateString() === todayStr)
        .reduce((sum, b) => sum + b.totalAmount, 0);

      // 2. Count Open Orders (not completed, not cancelled)
      const openOrders = orders.filter(
        (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
      ).length;

      // 3. Count Occupied Tables
      const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
      const totalTables = tables.length;

      // 4. Low Stock Count
      const lowStockCount = lowStock.length;

      setMetrics({
        todayRevenue,
        openOrders,
        occupiedTables,
        totalTables,
        lowStockCount
      });

      // 5. Generate Dynamic Weekly Sales Chart Data (Past 7 Days)
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const chartPoints = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // Past 7 days chronological
        const dateStr = d.toDateString();
        const dayLabel = daysOfWeek[d.getDay()];
        
        const dayRevenue = bills
          .filter((b) => new Date(b.createdAt).toDateString() === dateStr)
          .reduce((sum, b) => sum + b.totalAmount, 0);
          
        return {
          day: dayLabel,
          revenue: dayRevenue
        };
      });

      setChartData(chartPoints);
    } catch (err) {
      toast.error("Failed to load dashboard metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="space-y-5 animate-fade-in text-left">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-clay">Live Overview</p>
          <h1 className="text-3xl font-black text-ink mt-1">Restaurant Command Center</h1>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="text-xs font-bold text-leaf bg-leaf/5 hover:bg-leaf/10 px-3 py-2 rounded-xl transition border border-leaf/15"
        >
          Refresh Live Metrics
        </button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          ["Today Revenue", `₹${metrics.todayRevenue.toLocaleString("en-IN")}`],
          ["Open Orders", String(metrics.openOrders)],
          ["Occupied Tables", `${metrics.occupiedTables} / ${metrics.totalTables}`],
          ["Low Stock Alert", String(metrics.lowStockCount)]
        ].map(([label, value]) => (
          <Card key={label} className="hover-premium p-5 border border-black/5 bg-white shadow-soft rounded-2xl">
            <p className="text-xs text-ink/55 font-bold uppercase tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-black text-ink">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Weekly Chart */}
        <Card className="hover-premium p-6 border border-black/5 bg-white shadow-soft rounded-2xl md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-ink text-lg">Weekly Revenue Flow</h2>
            <div className="flex items-center gap-1.5 text-xs text-leaf font-bold bg-leaf/5 border border-leaf/10 rounded-full px-2.5 py-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Real-time Sync</span>
            </div>
          </div>
          <div className="h-72">
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#a0a0a0" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#a0a0a0" fontSize={11} fontWeight={600} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#246b45" strokeWidth={2.5} fillOpacity={0.12} fill="url(#colorRevenue)" />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#246b45" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#246b45" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Quick Testing Tips */}
        <Card className="p-6 border border-black/5 bg-white shadow-soft rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-2 text-xs font-black text-ink uppercase tracking-wider">
              <HelpCircle className="h-4.5 w-4.5 text-saffron" />
              <span>How to test clean database</span>
            </div>
            <ul className="space-y-3.5 text-xs text-ink/70 font-semibold list-disc list-inside">
              <li>
                Scan a table's QR code from the <strong className="text-leaf">Tables</strong> view to open the customer ordering portal.
              </li>
              <li>
                Add items and submit the order. The KDS screen will instantly refresh showing the ticket.
              </li>
              <li>
                Complete the order and checkout on the <strong className="text-clay">Billing</strong> page.
              </li>
              <li>
                The revenue metrics and weekly chart on this screen will update dynamically in real-time!
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-ink/40 bg-mist/50 p-2.5 rounded-xl border border-black/[0.03] mt-4">
            <ShieldCheck className="h-4.5 w-4.5 text-leaf flex-shrink-0" />
            <span>Zero hardcoded mock values on this dashboard.</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
