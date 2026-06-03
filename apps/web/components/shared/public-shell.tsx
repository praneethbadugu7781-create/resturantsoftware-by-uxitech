import { PublicNav } from "./public-nav";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <PublicNav />
      {children}
    </main>
  );
}
