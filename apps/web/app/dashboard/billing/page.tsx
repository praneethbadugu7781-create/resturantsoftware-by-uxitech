"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/dashboard/role-guard";
import {
  CreditCard,
  Search,
  CheckCircle,
  Receipt,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Bill = {
  id: string;
  tableId: string;
  table?: {
    tableNumber: string;
  };
  sessionId: string;
  subtotal: number;
  gstAmount: number;
  gstPercent: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "CASH" | "UPI" | "CARD" | "SPLIT";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "VOID";
  createdAt: string;
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [settling, setSettling] = useState(false);

  // Fetch Bills on load
  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      toast.error("Failed to load bills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  // Settle Bill Payment
  const handleSettlePayment = async () => {
    if (!selectedBill) return;
    try {
      setSettling(true);
      const res = await api.patch(`/bills/${selectedBill.id}/payment`, {
        paymentMethod
      });
      toast.success(`Bill settled successfully with ${paymentMethod}!`);
      
      // Update local bills list
      setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? res.data : b)));
      setSelectedBill(res.data);
    } catch (err) {
      toast.error("Failed to settle payment");
      console.error(err);
    } finally {
      setSettling(false);
    }
  };

  // Open PDF Invoice
  const handlePrintPDF = (billId: string) => {
    const url = `http://localhost:4000/api/v1/bills/${billId}/pdf`;
    window.open(url, "_blank");
  };

  // Search filter
  const filteredBills = bills.filter((bill) => {
    const term = searchQuery.toLowerCase();
    return (
      bill.id.toLowerCase().includes(term) ||
      bill.tableId.toLowerCase().includes(term) ||
      (bill.table?.tableNumber && bill.table.tableNumber.toLowerCase().includes(term)) ||
      bill.paymentStatus.toLowerCase().includes(term)
    );
  });

  return (
    <RoleGuard allowedRoles={["OWNER", "MANAGER", "CASHIER"]}>
      <section className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-clay">POS Settle Center</p>
          <h1 className="text-3xl font-extrabold text-ink mt-1">Billing & Settlements</h1>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bills List Table */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-0 border border-black/5 shadow-soft rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-black/10 p-4">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full bg-transparent text-sm outline-none text-ink"
                  placeholder="Search bills by ID, Table, or Status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-mist/40 text-ink/70 font-semibold border-b border-black/5">
                      <tr>
                        <th className="px-5 py-4">Bill ID</th>
                        <th className="px-5 py-4">Table</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Method</th>
                        <th className="px-5 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredBills.map((bill) => (
                        <tr
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          className={`hover:bg-mist/20 cursor-pointer transition-colors ${
                            selectedBill?.id === bill.id ? "bg-mist/30" : ""
                          }`}
                        >
                          <td className="px-5 py-4 font-bold text-ink truncate max-w-[120px]">
                            #{bill.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-5 py-4 font-semibold text-ink">
                            Table {bill.table?.tableNumber || bill.tableId.slice(-3).toUpperCase()}
                          </td>
                          <td className="px-5 py-4 font-black text-ink">
                            Rs. {bill.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              bill.paymentStatus === "PAID"
                                ? "bg-green-500/10 text-green-700 border-green-500/20"
                                : bill.paymentStatus === "PENDING"
                                ? "bg-saffron/10 text-saffron border-saffron/20 animate-pulse"
                                : "bg-red-500/10 text-red-700 border-red-500/20"
                            }`}>
                              {bill.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-medium text-ink/60">{bill.paymentMethod}</td>
                          <td className="px-5 py-4 text-xs text-ink/50">
                            {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}

                      {filteredBills.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-20 text-ink/55 font-semibold">
                            No bills found matching search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Settle Checkout Side Panel */}
          <div className="lg:col-span-1">
            {selectedBill ? (
              <Card className="p-6 border border-black/5 shadow-soft rounded-2xl animate-scale-up flex flex-col justify-between min-h-[460px] bg-white">
                <div>
                  <div className="pb-4 border-b border-black/5 flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-black text-ink">Receipt Detail</h2>
                      <p className="text-[10px] text-ink/40 font-bold uppercase mt-0.5">Bill #{selectedBill.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedBill.paymentStatus === "PAID" ? "bg-green-500/10 text-green-700" : "bg-saffron/10 text-saffron"
                    }`}>
                      {selectedBill.paymentStatus}
                    </span>
                  </div>

                  {/* Summary Details */}
                  <div className="mt-5 space-y-3.5 border-b border-black/5 pb-4 text-sm text-ink/80 font-medium">
                    <div className="flex justify-between">
                      <span className="text-ink/50">Subtotal</span>
                      <span className="font-semibold text-ink">Rs. {selectedBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/50">GST ({selectedBill.gstPercent}%)</span>
                      <span className="font-semibold text-ink">Rs. {selectedBill.gstAmount.toFixed(2)}</span>
                    </div>
                    {selectedBill.serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ink/50">Service Charge</span>
                        <span className="font-semibold text-ink">Rs. {selectedBill.serviceCharge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedBill.discount > 0 && (
                      <div className="flex justify-between text-clay">
                        <span>Discount</span>
                        <span>- Rs. {selectedBill.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-black/10">
                      <span className="font-black text-ink">Grand Total</span>
                      <span className="text-xl font-black text-leaf">Rs. {selectedBill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Settle Action Panel */}
                  {selectedBill.paymentStatus === "PENDING" ? (
                    <div className="mt-5 space-y-4 animate-fade-in">
                      <h3 className="font-bold text-ink text-xs uppercase tracking-wider">Select Payment Method</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(["UPI", "CASH", "CARD"] as const).map((method) => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`rounded-xl border p-3.5 text-xs font-bold transition-all text-center ${
                              paymentMethod === method
                                ? "border-leaf bg-leaf/5 text-leaf ring-1 ring-leaf"
                                : "border-black/10 bg-white hover:border-black/25 text-ink/65"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 p-4 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center gap-3 text-xs font-bold text-green-700 animate-scale-up">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p>Settled successfully</p>
                        <p className="font-medium opacity-85 mt-0.5">Paid via {selectedBill.paymentMethod} on {new Date(selectedBill.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-5 border-t border-black/5 space-y-2.5">
                  {selectedBill.paymentStatus === "PENDING" && (
                    <Button
                      onClick={handleSettlePayment}
                      disabled={settling}
                      className="w-full py-4 text-xs font-bold bg-leaf hover:bg-leaf/90 flex items-center justify-center gap-1.5 active:scale-98 shadow-md"
                    >
                      <CreditCard className="h-4 w-4" />
                      {settling ? "Settling..." : `Collect & Settle Rs. ${selectedBill.totalAmount.toFixed(2)}`}
                    </Button>
                  )}
                  <Button
                    onClick={() => handlePrintPDF(selectedBill.id)}
                    className="w-full py-4 text-xs font-bold bg-transparent border border-black/10 text-ink hover:bg-mist flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Invoice
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex h-96 items-center justify-center bg-white rounded-2xl border border-black/5 text-center px-6">
                <div>
                  <Receipt className="h-12 w-12 text-ink/15 mx-auto" />
                  <h3 className="mt-4 font-bold text-ink">No Bill Selected</h3>
                  <p className="text-xs text-ink/45 mt-1 leading-relaxed">Select a bill from the settlement table on the left to configure payments, process card/cash checkouts, and print receipts.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </RoleGuard>
  );
}
