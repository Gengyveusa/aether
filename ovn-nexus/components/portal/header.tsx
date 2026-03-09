"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Settings, Bell } from "lucide-react";

interface HeaderProps {
  user?: { full_name: string; role: string; email: string } | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Welcome back{user ? `, ${user.full_name}` : ""}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <form action="/api/auth/signout" method="POST">
          <Button variant="ghost" size="icon" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
        {user && (
          <div className="ml-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
