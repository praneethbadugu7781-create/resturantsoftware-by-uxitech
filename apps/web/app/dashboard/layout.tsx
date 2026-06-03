import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f8f5] dark:bg-[#121612]">
      <Sidebar />
      <section className="px-4 py-5 lg:ml-64 lg:px-8">
        {children}
      </section>
    </main>
  );
}
