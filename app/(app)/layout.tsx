import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SyncIndicator } from "@/components/SyncIndicator";
import { SyncProvider } from "@/components/SyncProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SyncProvider />
      <header className="border-b">
        <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/cows" className="text-sm font-medium">
            Vacas
          </Link>
          <Link href="/milking" className="text-sm font-medium">
            Ordeño
          </Link>
          <Link href="/dispatch" className="text-sm font-medium">
            Despacho
          </Link>
          <Link href="/dashboard" className="text-sm font-medium">
            Panel
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <SyncIndicator />
            <LogoutButton />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
