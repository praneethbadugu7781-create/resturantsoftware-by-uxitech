import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <form className="mt-6 grid gap-4 rounded-lg border bg-white p-5">
        {["Restaurant Name", "GST Number", "GST Percent", "Service Charge Percent", "Bill Footer Text"].map((field) => <input key={field} className="rounded-md border px-4 py-3" placeholder={field} />)}
        <Button>Save Settings</Button>
      </form>
    </section>
  );
}
