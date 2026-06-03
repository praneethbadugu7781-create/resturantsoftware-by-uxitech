"use client";

import { KdsBoard } from "@/components/kitchen/kds-board";
import { RoleGuard } from "@/components/dashboard/role-guard";

export default function KitchenPage() {
  return (
    <RoleGuard allowedRoles={["OWNER", "MANAGER", "KITCHEN"]}>
      <KdsBoard />
    </RoleGuard>
  );
}
