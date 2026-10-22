"use client";

import { LogOut } from "lucide-react";
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
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="min-w-11"
        aria-label="Salir"
      >
        <LogOut aria-hidden />
        <span className="hidden sm:inline">Salir</span>
      </Button>
    </form>
  );
}
