"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Sparkles,
  Table2,
  Users,
  UtensilsCrossed,
} from "lucide-react";

type LinkItem = [string, string, React.ComponentType<{ className?: string }>];

const links: LinkItem[] = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Tables", "/dashboard/tables", Table2],
  ["Menu Book", "/dashboard/menu", BookOpen],
  ["Reservations", "/dashboard/reservations", CalendarCheck],
  ["Orders", "/dashboard/orders", UtensilsCrossed],
  ["Billing", "/dashboard/billing", CreditCard],
  ["Kitchen", "/dashboard/kitchen", ChefHat],
  ["Inventory", "/dashboard/inventory", Package],
  ["Staff", "/dashboard/staff", Users],
  ["Customers", "/dashboard/customers", Users],
  ["Reports", "/dashboard/reports", BarChart3],
  ["Insights", "/dashboard/insights", Sparkles],
  ["Settings", "/dashboard/settings", Settings],
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userRole = user?.role ?? "OWNER";

  // Filter links based on role
  const visibleLinks = links.filter(([_, href]) => {
    if (userRole === "OWNER" || userRole === "MANAGER") return true;
    if (userRole === "KITCHEN") return href === "/dashboard/kitchen";
    if (userRole === "CASHIER") return href === "/dashboard/tables" || href === "/dashboard/billing";
    if (userRole === "WAITER") return href === "/dashboard/tables" || href === "/dashboard/orders";
    return false;
  });

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/10 bg-white px-3 py-4 lg:flex lg:flex-col lg:justify-between animate-fade-in">
      <div>
        <div className="mb-6 flex items-center justify-between px-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-clay">UXITECH</p>
            <h1 className="text-lg font-bold text-ink">Restaurant OS</h1>
          </div>
          <div className="relative">
            <span className="absolute right-0 top-0 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron"></span>
            </span>
            <Bell className="h-5 w-5 text-ink/70 hover:text-ink cursor-pointer transition-colors" />
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-2 mb-6 rounded-lg bg-mist/40 p-3 border border-black/5 animate-scale-up">
            <p className="text-xs text-ink/50 uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="font-bold text-ink truncate mt-0.5">{user.name || "User"}</p>
            <span className="inline-block mt-1.5 rounded-full bg-leaf/10 px-2 py-0.5 text-[10px] font-bold text-leaf uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        )}

        <nav className="space-y-1">
          {visibleLinks.map(([label, href, Icon]) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-mist text-leaf shadow-sm scale-[1.02]"
                    : "text-ink/75 hover:bg-mist/40 hover:text-leaf hover:translate-x-1"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-leaf animate-pulse" : "text-ink/50 group-hover:text-leaf"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-2 pt-4 border-t border-black/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-clay hover:bg-clay/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
