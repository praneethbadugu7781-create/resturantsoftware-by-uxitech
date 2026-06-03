"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import {
  ShoppingCart,
  Minus,
  Plus,
  ReceiptText,
  Clock,
  ChevronRight,
  Sparkles,
  Utensils,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  isVeg: boolean;
  preparationTime: number;
};

type Category = {
  id: string;
  name: string;
};

type TrackedItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
  status: string;
  menuItem: {
    name: string;
    isVeg: boolean;
  };
};

type TrackedOrder = {
  id: string;
  status: string;
  orderType: string;
  totalAmount: number;
  createdAt: string;
  items: TrackedItem[];
};

export function MobileOrder({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<"menu" | "cart" | "track">("menu");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  // Tracking State
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);
  const [trackedSession, setTrackedSession] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const { items: cart, add, remove, clear } = useCartStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load Menu and Table Details
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await api.get(`/qr/${token}`);
        setTableInfo(response.data.table);
        setCategories(response.data.categories);
        setMenuItems(response.data.menu);
      } catch (err) {
        toast.error("Failed to load table details. Invalid QR code.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Load Tracking Details
  const loadTrackingData = async () => {
    try {
      setTrackingLoading(true);
      const response = await api.get(`/qr/${token}/track`);
      setTrackedSession(response.data.session);
      setTrackedOrders(response.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "track") {
      loadTrackingData();
    }
  }, [activeTab]);

  // Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      setPlacingOrder(true);
      const itemsPayload = cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        specialInstructions: ""
      }));
      await api.post(`/qr/${token}/order`, { items: itemsPayload });
      toast.success("Order placed successfully! Sent to kitchen.");
      clear();
      setActiveTab("track");
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Request Bill
  const handleRequestBill = async () => {
    try {
      await api.post(`/qr/${token}/bill-request`);
      setBillRequested(true);
      toast.success("Bill requested! Cashier will print it shortly.");
    } catch (err) {
      toast.error("Failed to request bill.");
      console.error(err);
    }
  };

  // Filter Items
  const filteredItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] bg-white items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-widest">Entering Restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-[#fcfdfc] pb-24 shadow-soft flex flex-col relative animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-clay">
            Table {tableInfo?.tableNumber || "?"} • {tableInfo?.area || "Seating"}
          </p>
          <h1 className="text-lg font-black text-ink">UXITECH Dining</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-leaf/10 text-leaf rounded-full px-3 py-1 text-xs font-bold animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Active Session
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-3">
        {activeTab === "menu" && (
          <div className="space-y-4">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === "All"
                    ? "bg-leaf text-white shadow-sm scale-105"
                    : "bg-white border border-black/5 text-ink/70 hover:bg-mist/30"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? "bg-leaf text-white shadow-sm scale-105"
                      : "bg-white border border-black/5 text-ink/70 hover:bg-mist/30"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items List */}
            <section className="space-y-3.5">
              {filteredItems.map((item, index) => {
                const inCart = cart.find((cartItem) => cartItem.id === item.id);
                return (
                  <article
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm hover-premium animate-slide-up"
                  >
                    <div className="flex gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover border border-black/5"
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between min-h-[80px]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full border ${item.isVeg ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"}`} title={item.isVeg ? "Veg" : "Non-Veg"}></span>
                            <h2 className="font-extrabold text-sm text-ink leading-tight">{item.name}</h2>
                          </div>
                          <p className="text-[11px] text-ink/50 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-black text-sm text-ink">Rs. {item.price}</p>
                          <div className="flex items-center gap-2">
                            {inCart ? (
                              <div className="flex items-center gap-2.5 bg-mist/50 rounded-lg p-1 border border-black/5 animate-scale-up">
                                <button title="Remove" className="rounded-md bg-white border border-black/5 p-1.5 active:scale-95 shadow-sm" onClick={() => remove(item.id)}>
                                  <Minus className="h-3 w-3 text-ink" />
                                </button>
                                <span className="w-4 text-center text-xs font-bold text-ink">{inCart.quantity}</span>
                                <button title="Add" className="rounded-md bg-white border border-black/5 p-1.5 active:scale-95 shadow-sm" onClick={() => add(item)}>
                                  <Plus className="h-3 w-3 text-ink" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => add(item)}
                                className="rounded-lg bg-leaf hover:bg-leaf/90 text-white font-bold px-3 py-1.5 text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        )}

        {activeTab === "cart" && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-leaf" /> Review Cart
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 animate-scale-up">
                <ShoppingCart className="h-16 w-16 text-ink/20 mx-auto animate-pulse" />
                <h3 className="mt-4 font-bold text-ink">Your cart is empty</h3>
                <p className="text-xs text-ink/50 mt-1">Go to Menu tab to add items to your table order.</p>
                <Button onClick={() => setActiveTab("menu")} className="mt-6">Browse Menu</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="p-0 border border-black/5 shadow-soft rounded-2xl overflow-hidden">
                  <div className="p-4 bg-mist/20 border-b border-black/5">
                    <p className="text-[10px] font-bold text-ink/50 uppercase">Seating Table {tableInfo?.tableNumber}</p>
                  </div>
                  <div className="divide-y divide-black/5">
                    {cart.map((item) => (
                      <div key={item.id} className="p-4 flex justify-between items-center bg-white animate-scale-up">
                        <div>
                          <p className="font-extrabold text-sm text-ink">{item.name}</p>
                          <p className="text-xs text-ink/50 mt-0.5">Rs. {item.price} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-mist/40 rounded-lg p-1 border border-black/5">
                            <button title="Remove" className="rounded-md bg-white border border-black/5 p-1 active:scale-95 shadow-sm" onClick={() => remove(item.id)}>
                              <Minus className="h-3 w-3 text-ink" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-ink">{item.quantity}</span>
                            <button title="Add" className="rounded-md bg-white border border-black/5 p-1 active:scale-95 shadow-sm" onClick={() => add(item)}>
                              <Plus className="h-3 w-3 text-ink" />
                            </button>
                          </div>
                          <span className="w-16 text-right font-black text-sm text-ink">Rs. {item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-mist/10 border-t border-black/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-ink/65">Subtotal</span>
                    <span className="text-base font-black text-ink">Rs. {total}</span>
                  </div>
                </Card>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full py-4 text-sm font-bold rounded-xl bg-leaf hover:bg-leaf/90 transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md"
                >
                  {placingOrder ? "Placing Order..." : "Confirm & Send to Kitchen"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "track" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-leaf" /> Active Orders
              </h2>
              <button
                onClick={loadTrackingData}
                disabled={trackingLoading}
                className="text-xs font-bold text-leaf hover:underline"
              >
                {trackingLoading ? "Refreshing..." : "Tap to Refresh"}
              </button>
            </div>

            {trackedOrders.length === 0 ? (
              <div className="text-center py-16 animate-scale-up">
                <Utensils className="h-16 w-16 text-ink/20 mx-auto animate-pulse" />
                <h3 className="mt-4 font-bold text-ink">No orders tracked yet</h3>
                <p className="text-xs text-ink/50 mt-1">Place an order from the menu tab first.</p>
                <Button onClick={() => setActiveTab("menu")} className="mt-6">Go to Menu</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm space-y-2.5">
                  <div className="flex justify-between text-xs text-ink/50">
                    <span>Session Status</span>
                    <span className="font-bold text-leaf uppercase">{trackedSession?.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-ink">Total Bill (approx)</span>
                    <span className="font-black text-ink">Rs. {trackedOrders.reduce((sum, order) => sum + order.totalAmount, 0)}</span>
                  </div>
                </div>

                {trackedOrders.map((order, orderIdx) => (
                  <Card key={order.id} className="p-0 border border-black/5 overflow-hidden animate-slide-up">
                    <div className="p-3 bg-mist/20 border-b border-black/5 flex justify-between items-center text-xs">
                      <span className="font-bold text-ink/60">Ticket #{order.id.slice(-6).toUpperCase()}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        order.status === "COMPLETED" ? "bg-green-500/10 text-green-600" : "bg-saffron/10 text-saffron"
                      }`}>{order.status}</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm text-ink/85">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span>{item.quantity}x {item.menuItem.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            item.status === "READY" ? "bg-green-500/10 text-green-600 animate-bounce" : "bg-mist text-ink/60"
                          }`}>{item.status.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}

                <div className="pt-6 border-t border-black/5 space-y-3">
                  {billRequested ? (
                    <div className="rounded-xl bg-saffron/10 text-saffron p-4 border border-saffron/15 text-center text-xs font-semibold animate-scale-up">
                      Bill Request Sent! Wait for staff to present it.
                    </div>
                  ) : (
                    <Button
                      onClick={handleRequestBill}
                      className="w-full py-4 text-sm font-bold rounded-xl border border-clay text-clay hover:bg-clay/5 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      Request Bill & Close Table
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-black/5 bg-white/90 backdrop-blur-md p-4 grid grid-cols-3 text-center text-xs text-ink/60 shadow-lg z-30">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex flex-col items-center gap-1 transition-colors font-bold ${
            activeTab === "menu" ? "text-leaf" : "text-ink/50 hover:text-leaf"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span>Menu</span>
        </button>

        <button
          onClick={() => setActiveTab("cart")}
          className={`flex flex-col items-center gap-1 transition-colors font-bold relative ${
            activeTab === "cart" ? "text-leaf" : "text-ink/50 hover:text-leaf"
          }`}
        >
          {cart.length > 0 && (
            <span className="absolute -top-1.5 right-6 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[9px] font-black text-white animate-scale-up">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
        </button>

        <button
          onClick={() => setActiveTab("track")}
          className={`flex flex-col items-center gap-1 transition-colors font-bold ${
            activeTab === "track" ? "text-leaf" : "text-ink/50 hover:text-leaf"
          }`}
        >
          <ReceiptText className="h-5 w-5" />
          <span>Track</span>
        </button>
      </nav>
    </main>
  );
}
