import Link from "next/link";
import { Utensils, ArrowRight } from "lucide-react";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf/10 text-leaf">
            <Utensils className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold tracking-tight">
            UXITECH <span className="font-normal text-ink/40 text-xs tracking-wider uppercase ml-1">Restaurant OS</span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-7 text-xs font-semibold text-ink/60 md:flex tracking-wide">
          <Link href="/features" className="transition hover:text-ink">Features</Link>
          <Link href="/how-it-works" className="transition hover:text-ink">How It Works</Link>
          <Link href="/pricing" className="transition hover:text-ink">Pricing</Link>
          <Link href="/about" className="transition hover:text-ink">Company</Link>
          <Link href="/contact" className="transition hover:text-ink">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs font-bold text-ink/55 hover:text-ink transition tracking-wide"
          >
            Staff Sign In
          </Link>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-1 rounded-lg bg-leaf px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-ink hover:scale-[1.01] active:scale-[0.99]"
          >
            Start Free Trial
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
