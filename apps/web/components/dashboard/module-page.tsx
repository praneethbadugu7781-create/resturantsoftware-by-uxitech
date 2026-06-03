import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

type ModulePageProps = {
  title: string;
  description: string;
  stats: { label: string; value: string; tone?: string }[];
  columns: string[];
  rows: string[][];
  action?: string;
};

export function ModulePage({ title, description, stats, columns, rows, action = "Create" }: ModulePageProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Dashboard</p>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink/60 dark:text-white/60">{description}</p>
        </div>
        <Button><Plus className="h-4 w-4" />{action}</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-ink/55 dark:text-white/55">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-black/10 p-4 dark:border-white/10">
          <Search className="h-4 w-4 text-ink/45 dark:text-white/45" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder={`Search ${title.toLowerCase()}`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-mist text-ink/70 dark:bg-white/10 dark:text-white/70">
              <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-black/5 dark:border-white/10">
                  {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
