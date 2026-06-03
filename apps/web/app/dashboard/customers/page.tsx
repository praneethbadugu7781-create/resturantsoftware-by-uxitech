import { ModulePage } from "@/components/dashboard/module-page";

export default function CustomersPage() {
  return <ModulePage title="Customers" description="Profiles, visits, reservation history, feedback, VIP tags, notes, and CSV export." stats={[{ label: "Customers", value: "20" }, { label: "VIP", value: "3" }, { label: "Inactive", value: "2" }]} columns={["Name", "Phone", "Visits", "Tag"]} rows={[["Customer 1", "9888810000", "8", "VIP"], ["Customer 2", "9888810001", "3", "Regular"], ["Customer 3", "9888810002", "1", "New"]]} action="Export CSV" />;
}
