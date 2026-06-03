"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/dashboard/role-guard";
import {
  Utensils,
  Plus,
  Minus,
  CheckCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  Users,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type Table = {
  id: string;
  tableNumber: string;
  capacity: number;
  area: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING" | "BLOCKED";
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
};

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItemId: string;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
};

const statusColors: Record<Table["status"], string> = {
  AVAILABLE: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  OCCUPIED: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  RESERVED: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  CLEANING: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  BLOCKED: "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [sessionData, setSessionData] = useState<{ orders: Order[] } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [isTakingOrder, setIsTakingOrder] = useState(false);
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [areaFilter, setAreaFilter] = useState("All");

  // Load Tables and Menu
  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tables");
      setTables(res.data);
    } catch (err) {
      toast.error("Failed to load tables");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
    // Pre-load menu items for taking orders
    api.get("/menu")
      .then((res) => setMenuItems(res.data))
      .catch((err) => console.error("Failed to load menu", err));
  }, []);

  // Load Table Session details
  const handleSelectTable = async (table: Table) => {
    setSelectedTable(table);
    setIsTakingOrder(false);
    setOrderCart({});
    if (table.status === "OCCUPIED" || table.status === "CLEANING") {
      try {
        setSidebarLoading(true);
        const res = await api.get(`/tables/${table.id}/session`);
        setSessionData(res.data);
      } catch (err) {
        console.error("No active session found", err);
        setSessionData(null);
      } finally {
        setSidebarLoading(false);
      }
    } else {
      setSessionData(null);
    }
  };

  // Change Table Status directly
  const handleUpdateStatus = async (tableId: string, status: Table["status"]) => {
    try {
      const res = await api.patch(`/tables/${tableId}`, { status });
      setTables((prev) => prev.map((t) => (t.id === tableId ? res.data : t)));
      if (selectedTable?.id === tableId) {
        setSelectedTable(res.data);
      }
      toast.success(`Table updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Cart operations
  const addToCart = (itemId: string) => {
    setOrderCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setOrderCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId] > 1) {
        copy[itemId]--;
      } else {
        delete copy[itemId];
      }
      return copy;
    });
  };

  // Submit Waiter Order (KOT)
  const handleSubmitOrder = async () => {
    if (!selectedTable || Object.keys(orderCart).length === 0) return;
    try {
      const itemsPayload = Object.entries(orderCart).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }));
      await api.post("/orders", { tableId: selectedTable.id, items: itemsPayload });
      toast.success("Order sent to kitchen!");
      setIsTakingOrder(false);
      setOrderCart({});
      
      // Reload Table and Session
      const tableRes = await api.get(`/tables/${selectedTable.id}`);
      setTables((prev) => prev.map((t) => (t.id === selectedTable.id ? tableRes.data : t)));
      setSelectedTable(tableRes.data);
      
      const sessionRes = await api.get(`/tables/${selectedTable.id}/session`);
      setSessionData(sessionRes.data);
    } catch (err) {
      toast.error("Failed to place order");
      console.error(err);
    }
  };

  // Generate Bill for active session
  const handleGenerateBill = async () => {
    if (!selectedTable) return;
    try {
      const res = await api.post("/bills/generate", { tableId: selectedTable.id });
      toast.success(`Bill generated successfully! Total: Rs. ${res.data.totalAmount}`);
      loadTables();
      setSelectedTable(null);
    } catch (err) {
      toast.error("Failed to generate bill");
      console.error(err);
    }
  };

  // Filter tables by Area
  const areas = ["All", ...Array.from(new Set(tables.map((t) => t.area)))];
  const filteredTables = areaFilter === "All"
    ? tables
    : tables.filter((t) => t.area === areaFilter);

  return (
    <RoleGuard allowedRoles={["OWNER", "MANAGER", "WAITER", "CASHIER"]}>
      <section className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-clay">POS Billing Interface</p>
            <h1 className="text-3xl font-extrabold text-ink mt-1">Table Service (Floor View)</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg p-1 border border-black/5 shadow-sm">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setAreaFilter(area)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                    areaFilter === area
                      ? "bg-leaf text-white shadow-sm"
                      : "text-ink/60 hover:bg-mist/30"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Floor Plan Cards */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-black/5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {filteredTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`rounded-2xl border-2 p-5 text-center transition-all flex flex-col justify-between items-center h-36 ${
                      statusColors[table.status]
                    } ${
                      selectedTable?.id === table.id
                        ? "ring-2 ring-leaf ring-offset-2 scale-102"
                        : "shadow-sm"
                    }`}
                  >
                    <div>
                      <h3 className="text-2xl font-black">T{table.tableNumber}</h3>
                      <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider mt-1">{table.area}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      <Users className="h-3.5 w-3.5 opacity-60" />
                      <span className="text-xs font-black">{table.capacity}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Detail Panel */}
          <div className="lg:col-span-1">
            {selectedTable ? (
              <Card className="p-6 border border-black/5 shadow-soft rounded-2xl animate-scale-up flex flex-col justify-between min-h-[460px] bg-white">
                <div>
                  {/* Table Info Header */}
                  <div className="pb-4 border-b border-black/5 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-ink">Table {selectedTable.tableNumber}</h2>
                      <p className="text-xs text-ink/50 font-medium uppercase mt-0.5">{selectedTable.area} • {selectedTable.capacity} Pax</p>
                    </div>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${
                      selectedTable.status === "AVAILABLE" ? "bg-green-500/10 text-green-700 border-green-500/20" :
                      selectedTable.status === "OCCUPIED" ? "bg-red-500/10 text-red-700 border-red-500/20" :
                      selectedTable.status === "CLEANING" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
                      "bg-blue-500/10 text-blue-700 border-blue-500/20"
                    }`}>
                      {selectedTable.status}
                    </span>
                  </div>

                  {/* Dynamic Panel Content */}
                  {isTakingOrder ? (
                    /* Cart Order Taking Panel */
                    <div className="mt-4 space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-ink text-sm flex items-center gap-1.5"><Utensils className="h-4 w-4" /> KOT Menu</h3>
                        <button onClick={() => setIsTakingOrder(false)} className="text-xs font-semibold text-clay hover:underline">Cancel</button>
                      </div>
                      <div className="h-48 overflow-y-auto divide-y divide-black/5 border rounded-xl p-2 bg-mist/10">
                        {menuItems.map((item) => {
                          const quantity = orderCart[item.id] || 0;
                          return (
                            <div key={item.id} className="py-2.5 flex justify-between items-center">
                              <div className="pr-2">
                                <p className="text-xs font-bold text-ink flex items-center gap-1">
                                  <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`}></span>
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-ink/50 mt-0.5">Rs. {item.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-2 bg-white rounded-md p-0.5 border border-black/5">
                                    <button title="Remove" className="p-1 border rounded active:scale-95" onClick={() => removeFromCart(item.id)}><Minus className="h-2.5 w-2.5" /></button>
                                    <span className="w-4 text-center text-xs font-black">{quantity}</span>
                                    <button title="Add" className="p-1 border rounded active:scale-95" onClick={() => addToCart(item.id)}><Plus className="h-2.5 w-2.5" /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => addToCart(item.id)} className="border px-2.5 py-1 rounded text-xs font-bold hover:bg-mist transition-colors">Add</button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button onClick={handleSubmitOrder} disabled={Object.keys(orderCart).length === 0} className="w-full py-3.5 text-xs font-bold">
                        Confirm & Send KOT (Order)
                      </Button>
                    </div>
                  ) : (
                    /* Normal Session Display */
                    <div className="mt-5 space-y-4">
                      {sidebarLoading ? (
                        <div className="flex h-32 items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
                        </div>
                      ) : sessionData && sessionData.orders && sessionData.orders.length > 0 ? (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex justify-between items-center text-xs border-b pb-2">
                            <span className="font-bold text-ink/55">ACTIVE ORDERS</span>
                            <span className="font-bold text-ink bg-mist/60 px-2 py-0.5 rounded">
                              {sessionData.orders.length} Tickets
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                            {sessionData.orders.flatMap((order) => 
                              order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-ink/80">
                                  <span>{item.quantity}x {menuItems.find((m) => m.id === item.menuItemId)?.name || "Item"}</span>
                                  <span className="font-bold">Rs. {item.unitPrice * item.quantity}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="border-t border-black/5 pt-3.5 flex justify-between items-center">
                            <span className="text-sm font-bold text-ink/65">Subtotal</span>
                            <span className="text-base font-black text-ink">
                              Rs. {sessionData.orders.reduce((sum, order) => sum + order.totalAmount, 0)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-mist/20 rounded-xl border border-dashed border-black/10">
                          <Sparkles className="h-10 w-10 text-ink/20 mx-auto" />
                          <p className="mt-2 text-xs font-semibold text-ink/60">No Active Session or Orders</p>
                          <p className="text-[10px] text-ink/40 mt-0.5">Click Take Order to place a KOT.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Quick Actions */}
                {!isTakingOrder && (
                  <div className="mt-8 border-t border-black/5 pt-5 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => setIsTakingOrder(true)} className="flex items-center justify-center gap-1.5 text-xs py-3 rounded-xl bg-leaf">
                        <Plus className="h-3.5 w-3.5" /> Take Order
                      </Button>
                      <Button
                        onClick={handleGenerateBill}
                        disabled={!sessionData || !sessionData.orders || sessionData.orders.length === 0}
                        className="flex items-center justify-center gap-1.5 text-xs py-3 rounded-xl bg-saffron hover:bg-saffron/90"
                      >
                        <Receipt className="h-3.5 w-3.5" /> Print Bill
                      </Button>
                    </div>
                    {selectedTable.status === "CLEANING" && (
                      <Button onClick={() => handleUpdateStatus(selectedTable.id, "AVAILABLE")} className="w-full text-xs py-3 rounded-xl bg-transparent border border-green-500 text-green-700 hover:bg-green-50 flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4" /> Settle & Release Table
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              <div className="flex h-96 items-center justify-center bg-white rounded-2xl border border-black/5 text-center px-6">
                <div>
                  <Filter className="h-12 w-12 text-ink/15 mx-auto" />
                  <h3 className="mt-4 font-bold text-ink">No Table Selected</h3>
                  <p className="text-xs text-ink/45 mt-1 leading-relaxed">Select a table from the visual floor view on the left to see live session data, modify order items, and print bills.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </RoleGuard>
  );
}
