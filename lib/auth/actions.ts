"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function createUser(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect(
      `/register?error=${encodeURIComponent("Solo admin puede crear usuarios")}`,
    );
  }

  const role = formData.get("role") as string;
  if (role !== "owner" && role !== "capataz") {
    redirect(`/register?error=${encodeURIComponent("Rol inválido")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    email_confirm: true,
    user_metadata: {
      name: formData.get("name") as string,
      role,
    },
  });
  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/register?ok=1");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
