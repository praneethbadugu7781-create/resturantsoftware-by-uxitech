import { PublicShell } from "@/components/shared/public-shell";
import { Card } from "@/components/ui/card";

const menu = ["Paneer Tikka", "Chicken Biryani", "Dal Makhani", "Garlic Naan", "Rasmalai", "Fresh Lime Soda"];

export default function MenuPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Menu</h1>
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {["All", "Starters", "Biryani", "Main Course", "Desserts", "Beverages"].map((tab) => <button key={tab} className="rounded-full border px-4 py-2 text-sm">{tab}</button>)}
        </div>
        <input className="mt-5 w-full rounded-md border border-black/10 px-4 py-3" placeholder="Search dishes" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {menu.map((item, index) => (
            <Card key={item}>
              <div className="mb-4 h-36 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80&sig=${index})` }} />
              <h2 className="font-bold">{item}</h2>
              <p className="mt-1 text-sm text-ink/60">House special with balanced spice and fresh ingredients.</p>
              <p className="mt-3 font-bold">Rs. {140 + index * 35}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
