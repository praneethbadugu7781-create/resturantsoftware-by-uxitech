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
  splitBills?: any;
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [settling, setSettling] = useState(false);

  // Split bill states
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitType, setSplitType] = useState<"EQUAL" | "ITEMIZED">("EQUAL");
  const [equalParts, setEqualParts] = useState(2);
  const [sessionOrders, setSessionOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Item split state: list of { guestName: string, itemIds: string[] }
  const [itemSplits, setItemSplits] = useState<{ guestName: string; itemIds: string[] }[]>([
    { guestName: "Guest 1", itemIds: [] },
    { guestName: "Guest 2", itemIds: [] }
  ]);

  const handleOpenSplitModal = async () => {
    if (!selectedBill) return;
    setIsSplitModalOpen(true);
    try {
      setLoadingOrders(true);
      const res = await api.get(`/bills/table/${selectedBill.tableId}`);
      const flatItems = (res.data.orders || []).flatMap((o: any) => 
        (o.items || []).map((i: any) => ({
          ...i,
          orderId: o.id
        }))
      );
      setSessionOrders(flatItems);
      setItemSplits([
        { guestName: "Guest 1", itemIds: [] },
        { guestName: "Guest 2", itemIds: [] }
      ]);
    } catch (err) {
      toast.error("Failed to load session orders for split");
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCreateEqualSplit = async () => {
    if (!selectedBill) return;
    try {
      const res = await api.post(`/bills/${selectedBill.id}/split`, {
        splitType: "EQUAL",
        parts: equalParts
      });
      setSelectedBill(res.data);
      setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? res.data : b)));
      setIsSplitModalOpen(false);
      toast.success("Equal bill split generated!");
    } catch (err) {
      toast.error("Failed to split bill");
      console.error(err);
    }
  };

  const handleCreateItemizedSplit = async () => {
    if (!selectedBill) return;

    const assignedIds = new Set(itemSplits.flatMap(g => g.itemIds));
    const allItemIds = sessionOrders.map(i => i.id);
    const unassigned = allItemIds.filter(id => !assignedIds.has(id));

    if (unassigned.length > 0) {
      toast.error("Please assign all order items before splitting");
      return;
    }

    try {
      const res = await api.post(`/bills/${selectedBill.id}/split`, {
        splitType: "ITEMIZED",
        itemSplits: itemSplits
      });
      setSelectedBill(res.data);
      setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? res.data : b)));
      setIsSplitModalOpen(false);
      toast.success("Itemized bill split generated!");
    } catch (err) {
      toast.error("Failed to split bill");
      console.error(err);
    }
  };

  const handleSettleSplitPart = async (splitPartId: string, method: string) => {
    if (!selectedBill) return;
    try {
      const res = await api.patch(`/bills/${selectedBill.id}/payment`, {
        paymentMethod: method,
        splitPartId
      });
      setSelectedBill(res.data);
      setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? res.data : b)));
      toast.success(`Split part settled successfully via ${method}!`);
    } catch (err) {
      toast.error("Failed to settle split payment");
      console.error(err);
    }
  };

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
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const url = `${apiBase}/bills/${billId}/pdf`;
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
                  {selectedBill.splitBills ? (
                    <div className="mt-5 space-y-3">
                      <h3 className="font-bold text-ink text-xs uppercase tracking-wider">Split Payment Parts</h3>
                      <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                        {(selectedBill.splitBills as any[]).map((part) => (
                          <div key={part.id} className="p-3 border border-black/5 rounded-xl bg-mist/10 flex flex-col gap-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs font-extrabold text-ink">
                                {part.guestName ? part.guestName : `Part #${part.partNumber}`}
                              </span>
                              <span className="text-xs font-black text-leaf">Rs. {part.totalAmount.toFixed(2)}</span>
                            </div>
                            {part.items && (
                              <p className="text-[10px] text-ink/50 line-clamp-1">
                                {part.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-1 border-t border-black/5 pt-1.5">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                part.paymentStatus === "PAID" 
                                  ? "text-green-700 bg-green-500/10 border border-green-500/20" 
                                  : "text-saffron bg-saffron/10 border border-saffron/20"
                              }`}>
                                {part.paymentStatus}
                              </span>
                              {part.paymentStatus === "PENDING" ? (
                                <div className="flex gap-1">
                                  {["UPI", "CASH", "CARD"].map((m) => (
                                    <button
                                      key={m}
                                      onClick={() => handleSettleSplitPart(part.id, m)}
                                      className="text-[9px] font-black bg-white hover:bg-mist/30 border border-black/10 px-2 py-1 rounded shadow-sm"
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[9px] text-ink/40 font-semibold">Paid via {part.paymentMethod}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedBill.paymentStatus === "PENDING" ? (
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
                  {selectedBill.paymentStatus === "PENDING" && !selectedBill.splitBills && (
                    <>
                      <Button
                        onClick={handleSettlePayment}
                        disabled={settling}
                        className="w-full py-4 text-xs font-bold bg-leaf hover:bg-leaf/90 flex items-center justify-center gap-1.5 active:scale-98 shadow-md"
                      >
                        <CreditCard className="h-4 w-4" />
                        {settling ? "Settling..." : `Collect & Settle Rs. ${selectedBill.totalAmount.toFixed(2)}`}
                      </Button>
                      <Button
                        onClick={handleOpenSplitModal}
                        className="w-full py-4 text-xs font-bold bg-transparent border border-leaf/30 text-leaf hover:bg-leaf/5 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 text-leaf" />
                        Split Bill
                      </Button>
                    </>
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

        {/* Split Bill Dialog Modal */}
        {isSplitModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in text-left">
            <div className="w-full max-w-xl rounded-2xl border border-black/5 bg-white p-6 shadow-soft space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-ink">Split Bill POS Configurator</h3>
                  <p className="text-xs text-ink/50 mt-0.5">Table {selectedBill.table?.tableNumber || "Selected"} • Total Amount: Rs. {selectedBill.totalAmount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setIsSplitModalOpen(false)}
                  className="text-xs font-bold text-ink/40 hover:text-ink/80 bg-mist px-2.5 py-1 rounded-lg transition"
                >
                  Close
                </button>
              </div>

              {/* Split Type Selector */}
              <div className="flex gap-2 border-b border-black/5 pb-2">
                <button
                  onClick={() => setSplitType("EQUAL")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                    splitType === "EQUAL"
                      ? "bg-leaf/10 border-leaf/20 text-leaf"
                      : "bg-transparent border-transparent text-ink/60 hover:bg-mist/30"
                  }`}
                >
                  Split Equally
                </button>
                <button
                  onClick={() => setSplitType("ITEMIZED")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                    splitType === "ITEMIZED"
                      ? "bg-leaf/10 border-leaf/20 text-leaf"
                      : "bg-transparent border-transparent text-ink/60 hover:bg-mist/30"
                  }`}
                >
                  Split by Items
                </button>
              </div>

              {splitType === "EQUAL" ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ink/50 uppercase">Number of guests (parts)</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={equalParts}
                      onChange={(e) => setEqualParts(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-full rounded-xl border border-black/10 py-3.5 px-4 text-sm outline-none bg-white text-ink focus:border-leaf"
                    />
                  </div>
                  <div className="p-3 border border-black/5 bg-[#fafafa] rounded-xl flex justify-between items-center text-xs font-bold">
                    <span className="text-ink/50">Each Guest Pays:</span>
                    <span className="font-black text-leaf text-sm">Rs. {(selectedBill.totalAmount / equalParts).toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCreateEqualSplit}
                    className="w-full py-4 text-xs font-bold bg-leaf hover:bg-leaf/90 text-white shadow-md"
                  >
                    Generate Equal Splits
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loadingOrders ? (
                    <p className="text-center py-6 text-xs text-ink/40">Loading items...</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-ink/50 uppercase">Guests</span>
                        <button
                          onClick={() => setItemSplits([...itemSplits, { guestName: `Guest ${itemSplits.length + 1}`, itemIds: [] }])}
                          className="text-xs text-leaf font-bold hover:underline"
                        >
                          + Add Guest
                        </button>
                      </div>

                      {/* Guests List */}
                      <div className="flex gap-2 overflow-x-auto pb-2 pr-1">
                        {itemSplits.map((g, idx) => (
                          <div key={idx} className="flex-shrink-0 bg-mist/20 border border-black/5 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-ink">
                            <input
                              type="text"
                              value={g.guestName}
                              onChange={(e) => {
                                setItemSplits(itemSplits.map((item, i) => i === idx ? { ...item, guestName: e.target.value } : item));
                              }}
                              className="bg-transparent border-none outline-none font-bold w-16 text-center text-ink"
                            />
                            {itemSplits.length > 2 && (
                              <button
                                onClick={() => {
                                  setItemSplits(itemSplits.filter((_, i) => i !== idx));
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Items Assignment List */}
                      <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                        <h4 className="text-[10px] font-black text-ink/50 uppercase">Assign Items to Guests</h4>
                        {sessionOrders.map((item) => {
                          const assignedGuestIdx = itemSplits.findIndex(g => g.itemIds.includes(item.id));
                          return (
                            <div key={item.id} className="flex justify-between items-center p-3 border border-black/5 bg-[#fafafa] rounded-xl text-xs font-bold">
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-ink truncate">{item.menuItem?.name || "Item"}</p>
                                <p className="text-[10px] text-ink/40 font-medium">Rs. {item.unitPrice} each</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-ink/60">{item.quantity}x</span>
                                <select
                                  value={assignedGuestIdx !== -1 ? assignedGuestIdx : ""}
                                  onChange={(e) => {
                                    const guestIdx = parseInt(e.target.value);
                                    const cleanedSplits = itemSplits.map(g => ({
                                      ...g,
                                      itemIds: g.itemIds.filter(id => id !== item.id)
                                    }));
                                    if (!isNaN(guestIdx)) {
                                      cleanedSplits[guestIdx].itemIds.push(item.id);
                                    }
                                    setItemSplits(cleanedSplits);
                                  }}
                                  className="rounded-lg border border-black/10 py-1.5 px-3 bg-white text-ink cursor-pointer outline-none font-bold text-xs"
                                >
                                  <option value="">Unassigned</option>
                                  {itemSplits.map((g, idx) => (
                                    <option key={idx} value={idx}>
                                      {g.guestName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        onClick={handleCreateItemizedSplit}
                        className="w-full py-4 text-xs font-bold bg-leaf hover:bg-leaf/90 text-white shadow-md mt-2"
                      >
                        Generate Itemized Splits
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
