import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink } from "@/components/nav/NavLink";
import { SyncIndicator } from "@/components/SyncIndicator";
import { SyncProvider } from "@/components/SyncProvider";
import { brand } from "@/lib/brand/brand";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncProvider />
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
          <Link
            href="/cows"
            className="flex min-h-11 items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:outline-none"
          >
            <Image
              src={brand.assets.mark}
              alt=""
              width={32}
              height={32}
              priority
              unoptimized
            />
            <span className="font-heading text-lg font-semibold tracking-tight">
              {brand.name}
            </span>
          </Link>

          <nav
            aria-label="Principal"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:overflow-visible sm:pb-0"
          >
            <NavLink href="/cows">Vacas</NavLink>
            <NavLink href="/milking">Ordeño</NavLink>
            <NavLink href="/dispatch">Despacho</NavLink>
            <NavLink href="/dashboard">Panel</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <SyncIndicator />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
