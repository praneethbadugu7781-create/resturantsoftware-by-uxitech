import { PublicShell } from "@/components/shared/public-shell";

export default function GalleryPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => <div key={index} className="h-56 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80&sig=${index})` }} />)}
        </div>
      </section>
    </PublicShell>
  );
}
