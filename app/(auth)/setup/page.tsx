import type { Metadata } from "next";
import Link from "next/link";
import { hasAdmin } from "@/lib/auth/profile";
import { canSetupAdmin } from "@/lib/auth/setup";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFirstAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Configuración inicial",
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  datos: "Completá nombre, email y una contraseña de al menos 6 caracteres.",
  create: "No se pudo crear el admin. Revisá los datos e intentá de nuevo.",
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const adminExists = await hasAdmin();
  const canSetup = canSetupAdmin({
    token: searchParams.token,
    expected: process.env.SETUP_TOKEN,
    adminExists,
  });
  const errorMessage = searchParams.error
    ? (errorMessages[searchParams.error] ?? errorMessages.create)
    : null;

  if (adminExists) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Configuración completa</CardTitle>
          <CardDescription>
            Ya existe un administrador. Iniciá sesión con esa cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Ir al login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!canSetup) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Configuración inicial</CardTitle>
          <CardDescription>
            Este link no es válido. Fijate que incluya el token de
            configuración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Ir al login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Configuración inicial</CardTitle>
        <CardDescription>
          Creá el primer administrador de Rodeo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createFirstAdmin} className="space-y-5">
          <input type="hidden" name="token" value={searchParams.token} />
          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Crear admin
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
