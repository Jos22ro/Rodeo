"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { clearCurrentUserId } from "@/lib/auth/current-user";

export function LogoutButton() {
  return (
    <form
      action={logout}
      onSubmit={() => {
        clearCurrentUserId();
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        Salir
      </Button>
    </form>
  );
}
