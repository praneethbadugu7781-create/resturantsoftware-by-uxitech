"use client";

import { useState } from "react";
import { Clock, Volume2, CheckCircle2, RotateCcw } from "lucide-react";

type Ticket = {
  id: string;
  table: string;
  age: string;
  tone: string;
  items: string[];
};

const initialTickets: Ticket[] = [
  { id: "1", table: "T4", age: "08m", tone: "border-green-500", items: ["2x Paneer Tikka", "1x Butter Naan", "1x Lassi"] },
  { id: "2", table: "T8", age: "17m", tone: "border-saffron", items: ["1x Chicken Biryani", "2x Fresh Lime Soda"] },
  { id: "3", table: "T12", age: "24m", tone: "border-clay", items: ["3x Garlic Naan", "1x Dal Makhani"] },
  { id: "4", table: "T2", age: "03m", tone: "border-green-500", items: ["1x Hara Bhara Kebab", "1x Jeera Rice"] }
];

export function KdsBoard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);

  const handleMarkReady = (id: string) => {
    const ticketToComplete = tickets.find((ticket) => ticket.id === id);
    if (ticketToComplete) {
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      setCompletedTickets((prev) => [ticketToComplete, ...prev]);
    }
  };

  const handleReset = () => {
    setTickets(initialTickets);
    setCompletedTickets([]);
  };

  return (
    <section className="min-h-[85vh] bg-[#f8faf7] p-6 rounded-2xl border border-black/5 animate-fade-in">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Kitchen Operations</p>
          <h1 className="text-3xl font-extrabold text-ink">Kitchen Display System (KDS)</h1>
        </div>
        <div className="flex items-center gap-3">
          {(tickets.length === 0 && completedTickets.length > 0) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-mist transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset Board
            </button>
          )}
          <button className="rounded-md border border-black/10 bg-white p-3 text-ink/70 hover:text-ink transition-colors" title="Audio alerts">
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tickets.map((ticket, index) => (
          <article
            key={ticket.id}
            style={{ animationDelay: `${index * 80}ms` }}
            className={`rounded-2xl border-l-4 ${ticket.tone} bg-white p-6 shadow-soft hover-premium animate-slide-up flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <h2 className="text-2xl font-black text-ink">{ticket.table}</h2>
                <span className="flex items-center gap-1.5 text-sm font-bold text-saffron bg-saffron/10 px-2.5 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  {ticket.age}
                </span>
              </div>
              <ul className="mt-5 space-y-3.5 text-base text-ink/80 font-medium">
                {ticket.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-leaf/60 mt-2"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleMarkReady(ticket.id)}
              className="mt-8 w-full rounded-xl bg-leaf hover:bg-leaf/90 py-3.5 font-bold text-white shadow-sm transition-all duration-200 active:scale-98"
            >
              Mark Ready
            </button>
          </article>
        ))}

        {tickets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-scale-up">
            <CheckCircle2 className="h-16 w-16 text-leaf animate-bounce" />
            <h2 className="mt-4 text-2xl font-bold text-ink">All Tickets Prepared!</h2>
            <p className="mt-2 text-ink/50 text-sm">Great job! The kitchen queue is empty.</p>
          </div>
        )}
      </div>

      {completedTickets.length > 0 && (
        <div className="mt-12 border-t border-black/5 pt-8 animate-fade-in">
          <h2 className="text-lg font-bold text-ink/65 mb-4">Recently Prepared</h2>
          <div className="flex flex-wrap gap-3">
            {completedTickets.map((ticket) => (
              <span
                key={ticket.id}
                className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-leaf/80 shadow-sm animate-scale-up"
              >
                <CheckCircle2 className="h-4 w-4 text-leaf" />
                Table {ticket.table} ({ticket.items.length} items)
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
