"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch

  const userRole = user?.role ?? "OWNER";
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 animate-slide-up">
        <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-soft text-center hover-premium">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay/10 text-clay">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-ink">Access Restricted</h2>
          <p className="mt-3 text-sm text-ink/60 leading-relaxed">
            Your staff account role (<span className="font-bold text-clay">{userRole}</span>) is not authorized to access this module.
          </p>
          <div className="mt-8 border-t border-black/5 pt-6">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
