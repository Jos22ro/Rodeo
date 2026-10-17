import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", session.user.id)
    .single();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sistema Ganadería</h1>
        <p className="text-muted-foreground">
          Hola {profile?.name || session.user.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Rol: {profile?.role || "cargando..."}
        </p>
      </div>
    </main>
  );
}
