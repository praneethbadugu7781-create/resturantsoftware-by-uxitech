"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { FileDown, BarChart2 } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<{ category: string; sales: number }[]>([]);
  const [revenue, setRevenue] = useState(0);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [salesRes, foodRes] = await Promise.all([
        api.get("/reports/sales").catch(() => ({ data: { revenue: 0 } })),
        api.get("/reports/food").catch(() => ({ data: {} }))
      ]);

      setRevenue(salesRes.data.revenue || 0);

      // Map dynamic food quantities to chart data
      const foodRaw: Record<string, number> = foodRes.data;
      const formattedFood = Object.entries(foodRaw).map(([name, count]) => ({
        category: name,
        sales: count
      }));

      setFoodData(formattedFood);
    } catch (err) {
      toast.error("Failed to load reports metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

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
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Analytics & Exports</p>
          <h1 className="text-3xl font-black text-ink mt-1">Operational Reports</h1>
        </div>
        <button 
          onClick={fetchReportsData}
          className="text-xs font-bold text-leaf bg-leaf/5 hover:bg-leaf/10 px-3 py-2 rounded-xl transition border border-leaf/15"
        >
          Refresh Reports
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {[
          ["Total Revenue", `₹${revenue.toLocaleString("en-IN")}`],
          ["Food Popularity", `${foodData.length} items logged`],
          ["Inventory logs", "Automatic checks"],
          ["Reservation logs", "Table session records"],
          ["Staff logs", "Clock-in records"]
        ].map(([report, desc]) => (
          <Card key={report} className="p-4 border border-black/5 bg-white shadow-soft rounded-2xl hover:border-black/10 transition">
            <p className="font-extrabold text-xs uppercase text-ink/75">{report}</p>
            <p className="mt-1.5 text-[11px] text-ink/40 font-semibold">{desc}</p>
            <button className="mt-4 flex items-center gap-1 text-[10px] font-bold text-leaf hover:underline">
              <FileDown className="h-3 w-3" /> Export CSV
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-black/5 bg-white shadow-soft rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-ink text-lg">Menu Dishes Popularity (Quantities Ordered)</h2>
          <div className="flex items-center gap-1.5 text-xs text-clay font-bold bg-clay/5 border border-clay/10 rounded-full px-2.5 py-0.5">
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Quantity Metrics</span>
          </div>
        </div>

        {foodData.length === 0 ? (
          <div className="h-80 flex flex-col justify-center items-center text-center text-ink/45 font-semibold space-y-1 bg-mist/10 rounded-xl border border-dashed border-black/5">
            <BarChart2 className="h-10 w-10 text-ink/10" />
            <p className="text-sm">No sales logged yet</p>
            <p className="text-[10px]">Active orders will populate this chart automatically.</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={foodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#a0a0a0" fontSize={11} fontWeight={600} />
                <YAxis stroke="#a0a0a0" fontSize={11} fontWeight={600} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }} />
                <Bar dataKey="sales" name="Qty Ordered" fill="#b6533c" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </section>
  );
}
