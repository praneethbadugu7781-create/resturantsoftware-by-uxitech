import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-black/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5", className)} {...props} />;
}
