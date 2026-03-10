// @ts-nocheck
"use server";

import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/db/types";

export async function signIn(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) return { error: error.message };
  redirect("/hub");
}

export async function signUp(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = (formData.get("role") as UserRole) || "observer";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) return { error: error.message };

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    });
  }
  redirect("/hub");
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, institutions(*)")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
