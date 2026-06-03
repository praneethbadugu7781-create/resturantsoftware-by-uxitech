import { ModulePage } from "@/components/dashboard/module-page";

export default function StaffPage() {
  return <ModulePage title="Staff" description="Manage employee profiles, credentials, attendance, shifts, working hours, and payroll summaries." stats={[{ label: "Active", value: "5" }, { label: "Present", value: "4" }, { label: "Late", value: "1" }]} columns={["Name", "Role", "Phone", "Status"]} rows={[["Owner", "OWNER", "+91 90000 00000", "Active"], ["Waiter", "WAITER", "+91 90000 00000", "Active"], ["Kitchen", "KITCHEN", "+91 90000 00000", "Active"]]} action="Add Staff" />;
}
