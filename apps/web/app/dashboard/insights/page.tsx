"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Activity, AlertTriangle, Lightbulb } from "lucide-react";

type InsightData = {
  bestSellers: [string, number][];
  revenueForecast: number;
  stockout: { name: string; daysLeft: number }[];
  recommendations: string[];
};

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightData | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ai/insights");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load insights data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
      </div>
    );
  }

  const hasData = data && (data.bestSellers.length > 0 || data.stockout.length > 0 || data.revenueForecast > 0);

  return (
    <section className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">AI Operations Insights</p>
          <h1 className="text-3xl font-black text-ink mt-1">Recommendations & Projections</h1>
        </div>
        <button 
          onClick={fetchInsights}
          className="text-xs font-bold text-leaf bg-leaf/5 hover:bg-leaf/10 px-3 py-2 rounded-xl transition border border-leaf/15"
        >
          Recalculate AI Model
        </button>
      </div>

      {!hasData ? (
        <Card className="p-8 border border-black/5 bg-white shadow-soft rounded-2xl text-center space-y-3">
          <Activity className="h-12 w-12 text-ink/15 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-ink">Analyzing Restaurant Operations</h2>
          <p className="text-xs text-ink/50 leading-relaxed max-w-sm mx-auto font-medium">
            Not enough transaction data yet. Once customers scan table QR codes, submit orders, and you settle payments, our system will generate operational forecasts here.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Best Seller card */}
            <Card className="p-5 border border-black/5 bg-white shadow-soft rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-leaf uppercase tracking-wider">
                <Sparkles className="h-4.5 w-4.5" />
                <span>Best Seller Prediction</span>
              </div>
              <div>
                {data.bestSellers.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-lg font-black text-ink">
                      {data.bestSellers[0][0]}
                    </p>
                    <p className="text-xs text-ink/50 font-semibold">
                      Leads with {data.bestSellers[0][1]} items ordered in active logs.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-ink/40 font-medium">No sales data recorded yet.</p>
                )}
              </div>
            </Card>

            {/* Inventory forecast card */}
            <Card className="p-5 border border-black/5 bg-white shadow-soft rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>Inventory Forecast</span>
              </div>
              <div>
                {data.stockout.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-lg font-black text-rose-600">
                      {data.stockout[0].name} Warn
                    </p>
                    <p className="text-xs text-ink/50 font-semibold">
                      Estimated stock depletion in {data.stockout[0].daysLeft} days.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-ink/45 font-medium">Stock levels are currently healthy.</p>
                )}
              </div>
            </Card>

            {/* Revenue forecast card */}
            <Card className="p-5 border border-black/5 bg-white shadow-soft rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-saffron uppercase tracking-wider">
                <Activity className="h-4.5 w-4.5" />
                <span>Revenue Forecast</span>
              </div>
              <div>
                <p className="text-lg font-black text-ink">
                  ₹{data.revenueForecast.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-ink/50 font-semibold">
                  Moving average projection based on checkout bills.
                </p>
              </div>
            </Card>
          </div>

          {/* Recommendations action list */}
          <Card className="p-6 border border-black/5 bg-white shadow-soft rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-black/5 pb-2 text-xs font-black text-ink uppercase tracking-wider">
              <Lightbulb className="h-4.5 w-4.5 text-saffron" />
              <span>Operations Action List</span>
            </div>
            
            <ul className="space-y-3 text-xs text-ink/75 font-semibold list-disc list-inside">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </section>
  );
}
