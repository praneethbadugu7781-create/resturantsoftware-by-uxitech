import { ModulePage } from "@/components/dashboard/module-page";

export default function ReservationsPage() {
  return <ModulePage title="Reservations" description="Approve, reject, modify, waitlist, and recommend tables based on guest count." stats={[{ label: "Today", value: "12" }, { label: "Pending", value: "4" }, { label: "Waitlist", value: "2" }]} columns={["Guest", "Phone", "Time", "Status"]} rows={[["Aarav Mehta", "9888810001", "19:30", "Confirmed"], ["Priya Shah", "9888810002", "20:30", "Pending"], ["Nisha Rao", "9888810003", "13:30", "Confirmed"]]} action="New Booking" />;
}
