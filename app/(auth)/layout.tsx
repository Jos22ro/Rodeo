import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primary/10 to-transparent"
      />
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:outline-none"
      >
        <Image
          src={brand.assets.mark}
          alt=""
          width={48}
          height={48}
          priority
          unoptimized
        />
        <span className="font-heading text-2xl font-semibold tracking-tight">
          {brand.name}
        </span>
      </Link>
      {children}
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Ordeños y despachos de leche, en el campo y sin conexión.
      </p>
    </div>
  );
}
