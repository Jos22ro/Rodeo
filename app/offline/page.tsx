import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/lib/brand/brand";

export const metadata: Metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Image
          src={brand.assets.mark}
          alt=""
          width={56}
          height={56}
          className="mx-auto"
          unoptimized
        />
        <h1 className="text-xl font-semibold">Sin conexión</h1>
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta pantalla. Los datos guardados siguen
          disponibles. Probá de nuevo cuando recuperes señal.
        </p>
        <a
          href="/cows"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          Ir a vacas
        </a>
      </div>
    </main>
  );
}
