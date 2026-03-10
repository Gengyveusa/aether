// @ts-nocheck
"use server";

import { createServerSupabaseClient } from "@/lib/db/supabase-server";

// Helper: assert the current user is an admin
async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = data as { role: string } | null;
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { supabase, user };
}

/**
 * Generate a new research access key.
 * Admins only. Optionally pass a custom key string; otherwise a UUID is used.
 */
export async function generateResearchKey(customKey?: string) {
  try {
    const { supabase, user } = await requireAdmin();

    const keyValue =
      customKey?.trim() || crypto.randomUUID();

    const { data, error } = await supabase
      .from("research_access_keys")
      .insert({
        key: keyValue,
        created_by: user.id,
      })
      .select(
        `
        id,
        key,
        is_active,
        created_at,
        used_at,
        creator:profiles!research_access_keys_created_by_fkey(full_name, email),
        redeemer:profiles!research_access_keys_used_by_fkey(full_name, email)
      `
      )
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch (e: any) {
    return { error: e.message ?? "Failed to generate key" };
  }
}

/**
 * Deactivate (revoke) an existing research access key.
 * Admins only.
 */
export async function deactivateResearchKey(keyId: string) {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("research_access_keys")
      .update({ is_active: false })
      .eq("id", keyId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Failed to deactivate key" };
  }
}

/**
 * Grant research access directly to a user by email (no key required).
 * Admins only.
 */
export async function grantResearchAccessByEmail(email: string) {
  try {
    const { supabase } = await requireAdmin();

    // Look up the profile by email
    const { data: profileData, error: lookupError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email.trim().toLowerCase())
      .single();

    const profile = profileData as { id: string; full_name: string; email: string } | null;

    if (lookupError || !profile) {
      return { error: "No registered user found with that email." };
    }

    // Set research_access = true
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ research_access: true } as any)
      .eq("id", profile.id);

    if (updateError) return { error: updateError.message };

    return {
      data: {
        full_name: profile.full_name,
        email: profile.email,
      },
    };
  } catch (e: any) {
    return { error: e.message ?? "Failed to grant access" };
  }
}

/**
 * Redeem a research access key. Used by non-admin users on the hub page.
 */
export async function redeemResearchKey(keyValue: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Find the key
    const { data: keyData, error: keyError } = await supabase
      .from("research_access_keys")
      .select("id, is_active, used_by")
      .eq("key", keyValue.trim())
      .single();

    const accessKey = keyData as { id: string; is_active: boolean; used_by: string | null } | null;

    if (keyError || !accessKey) return { error: "Invalid key." };
    if (!accessKey.is_active) return { error: "This key has been deactivated." };
    if (accessKey.used_by) return { error: "This key has already been used." };

    // Mark key as used
    const { error: redeemError } = await supabase
      .from("research_access_keys")
      .update({
        used_by: user.id,
        used_at: new Date().toISOString(),
        is_active: false,
      } as any)
      .eq("id", accessKey.id);

    if (redeemError) return { error: redeemError.message };

    // Grant research access on the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ research_access: true } as any)
      .eq("id", user.id);

    if (profileError) return { error: profileError.message };

    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Failed to redeem key" };
  }
}
