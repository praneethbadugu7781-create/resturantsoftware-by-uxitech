import { ModulePage } from "@/components/dashboard/module-page";

export default function InventoryPage() {
  return <ModulePage title="Inventory" description="Track ingredients, suppliers, purchase orders, stock adjustments, and low-stock alerts." stats={[{ label: "Items", value: "20" }, { label: "Low Stock", value: "4" }, { label: "PO Ordered", value: "3" }]} columns={["Item", "Stock", "Min", "Supplier"]} rows={[["Chicken", "18 kg", "12 kg", "Fresh Farms"], ["Paneer", "9 kg", "10 kg", "Daily Dairy"], ["Rice", "42 kg", "15 kg", "Masala Mart"]]} action="Add Stock" />;
}
