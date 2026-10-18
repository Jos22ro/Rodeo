export const metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-2">
        <h1 className="text-xl font-semibold">Sin conexión</h1>
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta pantalla. Los datos ya guardados siguen
          disponibles; volvé a intentar cuando recuperes señal.
        </p>
      </div>
    </main>
  );
}
