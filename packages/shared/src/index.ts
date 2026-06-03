export const roles = ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"] as const;
export type Role = (typeof roles)[number];

export const tableStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "BLOCKED"] as const;
export type TableStatus = (typeof tableStatuses)[number];

export const orderStatuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const rolePermissions: Record<Role, string[]> = {
  OWNER: ["*"],
  MANAGER: ["tables", "reservations", "inventory", "reports", "customers", "orders"],
  CASHIER: ["billing", "orders:read"],
  WAITER: ["tables", "orders", "qr:read"],
  KITCHEN: ["kitchen", "orders:status"]
};

export const socketEvents = {
  orderNew: "order:new",
  orderItemReady: "order:itemReady",
  orderReady: "order:ready",
  orderServed: "order:served",
  billRequested: "bill:requested",
  billPaid: "bill:paid",
  tableStatusChange: "table:statusChange",
  reservationNew: "reservation:new",
  inventoryLowStock: "inventory:lowStock",
  notificationNew: "notification:new"
} as const;
