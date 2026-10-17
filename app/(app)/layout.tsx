import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link href="/cows" className="text-sm font-medium">
            Vacas
          </Link>
          <Link href="/milking" className="text-sm font-medium">
            Ordeño
          </Link>
          <Link href="/dispatch" className="text-sm font-medium">
            Despacho
          </Link>
          <form action={logout} className="ml-auto">
            <Button type="submit" variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
