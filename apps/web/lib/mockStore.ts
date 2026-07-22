// In-memory demo data store for Vercel preview & offline sandbox mode

export type Category = { id: string; name: string; sortOrder: number };
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
};
export type Table = {
  id: string;
  number: string;
  name: string;
  capacity: number;
  section: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DIRTY";
  token?: string;
  qrCodeUrl?: string;
};
export type OrderItem = {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
  selectedOptions?: any;
  menuItem?: Partial<MenuItem>;
};
export type Order = {
  id: string;
  tableId: string;
  tableNumber?: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};
export type Bill = {
  id: string;
  tableId: string;
  table?: Partial<Table>;
  sessionId: string;
  orderIds: string[];
  subtotal: number;
  gstAmount: number;
  gstPercent: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod?: string;
  splitBills?: any;
  createdAt: string;
};
export type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  guestCount: number;
  date: string;
  time: string;
  tableId?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  specialRequests?: string;
};
export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
};

// Initial Mock Seed Data
export const mockCategories: Category[] = [
  { id: "cat-1", name: "Starters", sortOrder: 1 },
  { id: "cat-2", name: "Main Course", sortOrder: 2 },
  { id: "cat-3", name: "Breads & Rice", sortOrder: 3 },
  { id: "cat-4", name: "Beverages", sortOrder: 4 },
  { id: "cat-5", name: "Desserts", sortOrder: 5 }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: "item-1",
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes cooked in rich tomato gravy with butter & cream",
    price: 290,
    category: "Main Course",
    categoryId: "cat-2",
    isVeg: true,
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: "item-2",
    name: "Chicken Dum Biryani",
    description: "Hyderabadi style slow cooked aromatic basmati rice with marinated chicken",
    price: 340,
    category: "Main Course",
    categoryId: "cat-2",
    isVeg: false,
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: "item-3",
    name: "Crispy Chilli Paneer",
    description: "Wok-tossed fried cottage cheese cubes in spicy Indo-Chinese sauce",
    price: 240,
    category: "Starters",
    categoryId: "cat-1",
    isVeg: true,
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: "item-4",
    name: "Garlic Butter Naan",
    description: "Leavened flatbread topped with minced garlic and fresh butter",
    price: 60,
    category: "Breads & Rice",
    categoryId: "cat-3",
    isVeg: true,
    isAvailable: true,
    preparationTime: 10
  },
  {
    id: "item-5",
    name: "Mango Lassi",
    description: "Thick chilled yogurt smoothie blended with Alphonso mango pulp",
    price: 90,
    category: "Beverages",
    categoryId: "cat-4",
    isVeg: true,
    isAvailable: true,
    preparationTime: 5
  },
  {
    id: "item-6",
    name: "Gulab Jamun with Ice Cream",
    description: "Warm milk solid dumplings in sugar syrup served with vanilla ice cream",
    price: 130,
    category: "Desserts",
    categoryId: "cat-5",
    isVeg: true,
    isAvailable: true,
    preparationTime: 8
  }
];

export const mockTables: Table[] = [
  { id: "tbl-1", number: "T1", name: "Table 1", capacity: 2, section: "Main Hall", status: "AVAILABLE", token: "tok-t1" },
  { id: "tbl-2", number: "T2", name: "Table 2", capacity: 4, section: "Main Hall", status: "OCCUPIED", token: "tok-t2" },
  { id: "tbl-3", number: "T3", name: "Table 3", capacity: 6, section: "Family VIP", status: "RESERVED", token: "tok-t3" },
  { id: "tbl-4", number: "T4", name: "Table 4", capacity: 4, section: "Terrace", status: "AVAILABLE", token: "tok-t4" },
  { id: "tbl-5", number: "T5", name: "Table 5", capacity: 8, section: "Private Room", status: "AVAILABLE", token: "tok-t5" }
];

export const mockOrders: Order[] = [
  {
    id: "ORD-101",
    tableId: "tbl-2",
    tableNumber: "T2",
    status: "PREPARING",
    totalAmount: 630,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    items: [
      { id: "oi-1", menuItemId: "item-1", quantity: 1, unitPrice: 290, menuItem: mockMenuItems[0] },
      { id: "oi-2", menuItemId: "item-2", quantity: 1, unitPrice: 340, menuItem: mockMenuItems[1] }
    ]
  },
  {
    id: "ORD-102",
    tableId: "tbl-2",
    tableNumber: "T2",
    status: "READY",
    totalAmount: 330,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    items: [
      { id: "oi-3", menuItemId: "item-3", quantity: 1, unitPrice: 240, menuItem: mockMenuItems[2] },
      { id: "oi-4", menuItemId: "item-5", quantity: 1, unitPrice: 90, menuItem: mockMenuItems[4] }
    ]
  }
];

export const mockBills: Bill[] = [
  {
    id: "BILL-2026-001",
    tableId: "tbl-2",
    table: mockTables[1],
    sessionId: "sess-t2",
    orderIds: ["ORD-101", "ORD-102"],
    subtotal: 960,
    gstAmount: 48,
    gstPercent: 5,
    serviceCharge: 20,
    discount: 0,
    totalAmount: 1028,
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 35 * 60000).toISOString()
  }
];

export const mockReservations: Reservation[] = [
  {
    id: "RES-1001",
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@gmail.com",
    guestCount: 6,
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    tableId: "tbl-3",
    status: "CONFIRMED",
    specialRequests: "Anniversary celebration table"
  },
  {
    id: "RES-1002",
    customerName: "Priya Verma",
    phone: "+91 91234 56789",
    email: "priya@gmail.com",
    guestCount: 2,
    date: new Date().toISOString().split("T")[0],
    time: "21:30",
    status: "PENDING",
    specialRequests: "Quiet corner table requested"
  }
];

export const mockInventory: InventoryItem[] = [
  { id: "inv-1", name: "Paneer (Cottage Cheese)", category: "Dairy", currentStock: 12, minStock: 5, unit: "kg", costPerUnit: 280 },
  { id: "inv-2", name: "Fresh Chicken", category: "Poultry", currentStock: 4, minStock: 10, unit: "kg", costPerUnit: 220 },
  { id: "inv-3", name: "Basmati Rice", category: "Grains", currentStock: 45, minStock: 15, unit: "kg", costPerUnit: 90 },
  { id: "inv-4", name: "Refined Cooking Oil", category: "Grocery", currentStock: 8, minStock: 15, unit: "L", costPerUnit: 140 },
  { id: "inv-5", name: "Amul Butter", category: "Dairy", currentStock: 6, minStock: 3, unit: "kg", costPerUnit: 520 }
];

export const mockStaff = [
  { id: "usr-1", name: "Admin Owner", email: "owner@uxitech.com", role: "OWNER", phone: "+91 90000 00001" },
  { id: "usr-2", name: "Branch Manager", email: "manager@uxitech.com", role: "MANAGER", phone: "+91 90000 00002" },
  { id: "usr-3", name: "Head Cashier", email: "cashier@uxitech.com", role: "CASHIER", phone: "+91 90000 00003" },
  { id: "usr-4", name: "Lead Waiter", email: "waiter@uxitech.com", role: "WAITER", phone: "+91 90000 00004" },
  { id: "usr-5", name: "Chef Master", email: "kitchen@uxitech.com", role: "KITCHEN", phone: "+91 90000 00005" }
];

export const mockCustomers = [
  { id: "cust-1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@gmail.com", totalVisits: 14, totalSpent: 18450, tag: "VIP Customer" },
  { id: "cust-2", name: "Priya Verma", phone: "+91 91234 56789", email: "priya@gmail.com", totalVisits: 6, totalSpent: 6200, tag: "Regular" },
  { id: "cust-3", name: "Amit Patel", phone: "+91 99887 76655", email: "amit@gmail.com", totalVisits: 2, totalSpent: 1950, tag: "New Guest" }
];

// Helper to handle API endpoint fallbacks seamlessly
export function handleMockRoute(method: string, url: string, data?: any): any {
  const cleanUrl = url.split("?")[0].replace(/\/$/, "");

  // Auth routes
  if (cleanUrl.endsWith("/auth/me")) {
    return { user: mockStaff[0] };
  }

  // Categories
  if (cleanUrl.endsWith("/categories") || cleanUrl.endsWith("/menu/categories")) {
    if (method === "get") return mockCategories;
    if (method === "post") {
      const newCat = { id: `cat-${Date.now()}`, name: data?.name || "New Category", sortOrder: mockCategories.length + 1 };
      mockCategories.push(newCat);
      return newCat;
    }
  }

  // Menu items
  if (cleanUrl.endsWith("/menu") || cleanUrl.includes("/menu/items")) {
    if (method === "get") return mockMenuItems;
    if (method === "post") {
      const newItem = { id: `item-${Date.now()}`, name: "New Dish", price: 200, category: "Main Course", isVeg: true, isAvailable: true, preparationTime: 15, ...data };
      mockMenuItems.push(newItem);
      return newItem;
    }
  }

  // Tables
  if (cleanUrl.endsWith("/tables")) {
    if (method === "get") return mockTables;
    if (method === "post") {
      const newTbl: Table = { id: `tbl-${Date.now()}`, number: `T${mockTables.length + 1}`, name: `Table ${mockTables.length + 1}`, capacity: 4, section: "Main Hall", status: "AVAILABLE", ...data };
      mockTables.push(newTbl);
      return newTbl;
    }
  }

  // Orders
  if (cleanUrl.endsWith("/orders")) {
    if (method === "get") return mockOrders;
    if (method === "post") {
      const newOrd: Order = { id: `ORD-${Date.now().toString().slice(-4)}`, tableId: data?.tableId || "tbl-1", tableNumber: "T1", status: "PENDING", totalAmount: data?.totalAmount || 350, createdAt: new Date().toISOString(), items: data?.items || [] };
      mockOrders.unshift(newOrd);
      return newOrd;
    }
  }

  // Bills
  if (cleanUrl.endsWith("/bills")) {
    if (method === "get") return mockBills;
  }
  if (cleanUrl.endsWith("/bills/generate")) {
    const newBill: Bill = { id: `BILL-2026-${mockBills.length + 1}`, tableId: data?.tableId || "tbl-2", table: mockTables[1], sessionId: "sess-1", orderIds: ["ORD-101"], subtotal: 600, gstAmount: 30, gstPercent: 5, serviceCharge: 0, discount: 0, totalAmount: 630, paymentStatus: "PENDING", createdAt: new Date().toISOString() };
    mockBills.unshift(newBill);
    return newBill;
  }

  // Reservations
  if (cleanUrl.endsWith("/reservations")) {
    if (method === "get") return mockReservations;
    if (method === "post") {
      const newRes: Reservation = { id: `RES-${Date.now().toString().slice(-4)}`, customerName: data?.customerName || "Guest", phone: data?.phone || "+91 90000 00000", guestCount: data?.guestCount || 2, date: new Date().toISOString().split("T")[0], time: "19:00", status: "PENDING" };
      mockReservations.unshift(newRes);
      return newRes;
    }
  }

  // Inventory
  if (cleanUrl.endsWith("/inventory")) {
    if (method === "get") return mockInventory;
  }
  if (cleanUrl.endsWith("/inventory/low-stock")) {
    return mockInventory.filter((i) => i.currentStock <= i.minStock);
  }

  // Staff & Customers
  if (cleanUrl.endsWith("/staff")) return mockStaff;
  if (cleanUrl.endsWith("/customers")) return mockCustomers;

  // Default empty array or object
  return [];
}
