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

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
          <CardDescription>Solo admin puede crear usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="space-y-4">
            {searchParams.error && (
              <p className="text-sm text-destructive">{searchParams.error}</p>
            )}
            {searchParams.ok && (
              <p className="text-sm text-green-600">Usuario creado</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
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
            <Button type="submit" className="w-full">
              Crear usuario
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="underline">
              Volver
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
