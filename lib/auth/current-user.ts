import { supabase } from "@/lib/supabase/client";

const USER_ID_KEY = "ganaderia.userId";

function readCachedUserId() {
  try {
    return window.localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const id = data.session?.user.id ?? null;

    if (id) {
      window.localStorage.setItem(USER_ID_KEY, id);
      return id;
    }
  } catch {
    return readCachedUserId();
  }

  return readCachedUserId();
}
