import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CallbackPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }
  redirect("/login");
}
