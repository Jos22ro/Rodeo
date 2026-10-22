import type { Metadata } from "next";
import Link from "next/link";
import { createUser } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Crear usuario",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Crear usuario</CardTitle>
        <CardDescription>Solo un admin puede crear usuarios.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createUser} className="space-y-5">
          {searchParams.error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {searchParams.error}
            </p>
          )}
          {searchParams.ok && (
            <p
              role="status"
              className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
            >
              Usuario creado
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
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" required>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="capataz">Capataz</SelectItem>
                <SelectItem value="owner">Dueño</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Crear usuario
          </Button>
        </form>
        <p className="mt-5 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Volver
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
