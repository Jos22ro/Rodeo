"use server";

import { redirect } from "next/navigation";
import { hasAdmin } from "@/lib/auth/profile";
import { canSetupAdmin } from "@/lib/auth/setup";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createFirstAdmin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const allowed = canSetupAdmin({
    token,
    expected: process.env.SETUP_TOKEN,
    adminExists: await hasAdmin(),
  });

  if (!allowed) {
    redirect("/setup?error=token");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    redirect(`/setup?token=${encodeURIComponent(token)}&error=datos`);
  }

  const { error } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "admin" },
  });

  if (error) {
    console.error("setup admin failed", error);
    redirect(`/setup?token=${encodeURIComponent(token)}&error=create`);
  }

  redirect("/login");
}
