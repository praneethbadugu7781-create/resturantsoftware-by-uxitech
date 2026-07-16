"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/dashboard/role-guard";
import {
  UtensilsCrossed,
  Search,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Utensils,
  Receipt,
  User,
} from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: {
    name: string;
    isVeg: boolean;
  };
};

type Order = {
  id: string;
  tableId: string;
  sessionId: string;
  orderType: "WAITER" | "QR_SELF";
  totalAmount: number;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED";
  createdAt: string;
  items: OrderItem[];
  table?: {
    tableNumber: string;
    area: string;
  };
};

const statusColors: Record<Order["status"], string> = {
  PENDING: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  ACCEPTED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  PREPARING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  READY: "bg-green-500/10 text-green-700 border-green-500/20 animate-pulse",
  SERVED: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  COMPLETED: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20",
};

const allowedStatuses: Order["status"][] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(false);
  const [kotPrintOrder, setKotPrintOrder] = useState<Order | null>(null);

  // Load active orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update Order Status
  const handleUpdateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      setUpdating(true);
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}!`);
      
      // Update local states
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...res.data, table: o.table } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...res.data, table: prev.table } : null);
      }
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Search filter
  const filteredOrders = orders.filter((order) => {
    const term = searchQuery.toLowerCase();
    const tableNum = order.table?.tableNumber?.toLowerCase() || "";
    return (
      order.id.toLowerCase().includes(term) ||
      tableNum.includes(term) ||
      order.status.toLowerCase().includes(term) ||
      order.orderType.toLowerCase().includes(term)
    );
  });

  return (
    <RoleGuard allowedRoles={["OWNER", "MANAGER", "WAITER"]}>
      <section className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-clay">Order Center</p>
          <h1 className="text-3xl font-extrabold text-ink mt-1">Live POS Orders</h1>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders List Table */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-0 border border-black/5 shadow-soft rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-black/10 p-4">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full bg-transparent text-sm outline-none text-ink"
                  placeholder="Search orders by ID, Table, Status, or Type..."
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
                        <th className="px-5 py-4">Order ID</th>
                        <th className="px-5 py-4">Table</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Type</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`hover:bg-mist/20 cursor-pointer transition-colors ${
                            selectedOrder?.id === order.id ? "bg-mist/30" : ""
                          }`}
                        >
                          <td className="px-5 py-4 font-bold text-ink truncate max-w-[120px]">
                            #{order.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-5 py-4 font-semibold text-ink">
                            Table {order.table?.tableNumber || "?"}
                          </td>
                          <td className="px-5 py-4 font-black text-ink">
                            Rs. {order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-5 py-4 font-medium text-ink/60">
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                              order.orderType === "WAITER" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"
                            }`}>
                              {order.orderType === "WAITER" ? "WAITER" : "QR SELF"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              statusColors[order.status]
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-ink/50">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-20 text-ink/55 font-semibold">
                            No orders found matching search query.
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
            {selectedOrder ? (
              <Card className="p-6 border border-black/5 shadow-soft rounded-2xl animate-scale-up flex flex-col justify-between min-h-[460px] bg-white">
                <div>
                  <div className="pb-4 border-b border-black/5 flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-black text-ink">Order Items</h2>
                      <p className="text-[10px] text-ink/40 font-bold uppercase mt-0.5">Ticket #{selectedOrder.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusColors[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* List of items */}
                  <div className="mt-5 space-y-3.5 border-b border-black/5 pb-4 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-xs text-ink/80">
                        <div>
                          <p className="font-extrabold text-ink flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"}`}></span>
                            {item.menuItem.name}
                          </p>
                          {(item as any).selectedOptions && ((item as any).selectedOptions as any[]).length > 0 && (
                            <p className="text-[9px] text-leaf font-black pl-3 mt-0.5">
                              + {((item as any).selectedOptions as any[]).map(o => o.optionName).join(", ")}
                            </p>
                          )}
                          <p className="text-[10px] text-ink/40 mt-0.5">Rs. {item.unitPrice} x {item.quantity}</p>
                        </div>
                        <span className="font-bold text-ink">Rs. {item.unitPrice * item.quantity}</span>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-black/10">
                      <span className="font-bold text-ink/65 text-xs">Total Amount</span>
                      <span className="text-base font-black text-ink">Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status update controller */}
                  <div className="mt-5 space-y-4">
                    <h3 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1"><Clock className="h-4 w-4 text-leaf" /> Update Cooking Status</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {allowedStatuses.map((status) => (
                        <button
                          key={status}
                          disabled={updating || selectedOrder.status === status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          className={`rounded-xl border p-2.5 text-[10px] font-bold transition-all text-center ${
                            selectedOrder.status === status
                              ? "border-leaf bg-leaf/5 text-leaf font-black ring-1 ring-leaf"
                              : "border-black/10 bg-white hover:border-black/25 text-ink/65"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-black/5 space-y-2.5">
                  <Button
                    onClick={() => setKotPrintOrder(selectedOrder)}
                    className="w-full py-4 text-xs font-bold bg-transparent border border-leaf/30 text-leaf hover:bg-leaf/5 flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="h-4 w-4" />
                    Print KOT Ticket
                  </Button>
                  <div className="rounded-xl bg-mist/20 p-4 border border-black/5 text-[10px] text-ink/60 space-y-1">
                    <p className="font-bold text-ink/75 uppercase">Metadata Summary</p>
                    <p><strong>Table:</strong> Table {selectedOrder.table?.tableNumber || "?"} ({selectedOrder.table?.area})</p>
                    <p><strong>Channel:</strong> {selectedOrder.orderType === "WAITER" ? "Staff Waiter POS" : "QR Customer Self-Order"}</p>
                    <p><strong>Time Placed:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex h-96 items-center justify-center bg-white rounded-2xl border border-black/5 text-center px-6">
                <div>
                  <UtensilsCrossed className="h-12 w-12 text-ink/15 mx-auto" />
                  <h3 className="mt-4 font-bold text-ink">No Order Selected</h3>
                  <p className="text-xs text-ink/45 mt-1 leading-relaxed">Select an active order ticket from the POS list on the left to review cooking workflows, manage quantities, and update statuses.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Visual KOT Simulation Popup */}
        {kotPrintOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 print:p-0 animate-fade-in text-left">
            <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-soft space-y-4 animate-scale-up print:shadow-none print:border-none print:w-full">
              <div className="border-b-2 border-dashed border-black/15 pb-4 text-center">
                <h2 className="text-xl font-black text-ink tracking-tight">KITCHEN ORDER TICKET (KOT)</h2>
                <p className="text-[10px] text-ink/50 mt-0.5 uppercase font-bold">Live Food prep receipt</p>
              </div>
              
              <div className="space-y-1 text-xs text-ink/75 font-semibold">
                <div className="flex justify-between">
                  <span>KOT ID: #{kotPrintOrder.id.slice(-8).toUpperCase()}</span>
                  <span>Date: {new Date(kotPrintOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Table: <strong>Table {kotPrintOrder.table?.tableNumber || "?"}</strong></span>
                  <span>Time: {new Date(kotPrintOrder.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Channel: {kotPrintOrder.orderType}</span>
                  <span>Status: <strong className="text-leaf">{kotPrintOrder.status}</strong></span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-black/15 pt-4">
                <table className="w-full text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b border-black/10 text-ink/50 pb-2">
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Item Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kotPrintOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-black/5">
                        <td className="py-2.5 valign-top w-8">{item.quantity}x</td>
                        <td className="py-2.5">
                          <p className="text-ink">{item.menuItem.name}</p>
                          {(item as any).selectedOptions && ((item as any).selectedOptions as any[]).length > 0 && (
                            <p className="text-[9px] text-leaf font-black mt-0.5">
                              + {((item as any).selectedOptions as any[]).map(o => o.optionName).join(", ")}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-dashed border-black/15 pt-4 text-center print:hidden space-y-2">
                <Button
                  onClick={() => window.print()}
                  className="w-full py-3 text-xs font-bold bg-leaf hover:bg-leaf/90 text-white flex items-center justify-center gap-1.5"
                >
                  Print Ticket (Browser)
                </Button>
                <button
                  onClick={() => setKotPrintOrder(null)}
                  className="w-full py-2.5 text-xs font-bold bg-transparent border border-black/10 text-ink/65 hover:bg-mist rounded-xl transition"
                >
                  Close Print Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
