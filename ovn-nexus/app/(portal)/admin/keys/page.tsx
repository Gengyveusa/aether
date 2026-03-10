// @ts-nocheck
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { AdminKeysClient } from "./client";

export default async function AdminKeysPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/hub");

  const { data: keys } = await supabase
    .from("research_access_keys")
    .select(
      `
      id, key, is_active, created_at, used_at,
      creator:created_by(full_name, email),
      redeemer:used_by(full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  return <AdminKeysClient initialKeys={keys ?? []} />;
}
