import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileRole } from "@/lib/auth/roles";

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: ProfileRole;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // shortcut: read own profile with the admin client because the profiles
    // RLS admin policies recurse; switch back to the user client when fixed
    const { data } = await createAdminClient()
      .from("profiles")
      .select("id, email, name, role")
      .eq("id", user.id)
      .maybeSingle();

    return (data as Profile | null) ?? null;
  } catch {
    return null;
  }
}

export async function hasAdmin(): Promise<boolean> {
  const { count, error } = await createAdminClient()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) {
    console.error("hasAdmin failed", error);
    return true;
  }

  return (count ?? 0) > 0;
}
