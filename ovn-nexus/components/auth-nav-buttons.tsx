"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/db/supabase-client";
import type { User } from "@supabase/supabase-js";

export function AuthNavButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/hub">
          <Button size="sm" className="gap-2">
            Member Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/signup">
        <Button size="sm">Get Started</Button>
      </Link>
    </div>
  );
}
