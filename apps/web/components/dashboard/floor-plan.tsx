const tables = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  x: 8 + (index % 5) * 18,
  y: 12 + Math.floor(index / 5) * 28,
  status: ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "BLOCKED"][index % 5]
}));

const colors: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  OCCUPIED: "bg-red-500",
  RESERVED: "bg-yellow-400",
  CLEANING: "bg-zinc-500",
  BLOCKED: "bg-blue-500"
};

export function FloorPlan() {
  return (
    <div className="relative h-[420px] rounded-lg border border-dashed border-black/20 bg-[linear-gradient(#d8e2d7_1px,transparent_1px),linear-gradient(90deg,#d8e2d7_1px,transparent_1px)] bg-[size:36px_36px]">
      {tables.map((table) => (
        <button
          key={table.id}
          className={`absolute flex h-16 w-16 items-center justify-center rounded-lg text-sm font-bold text-white shadow-soft ${colors[table.status]}`}
          style={{ left: `${table.x}%`, top: `${table.y}%` }}
          title={`Table ${table.id} ${table.status}`}
        >
          T{table.id}
        </button>
      ))}
    </div>
  );
}
