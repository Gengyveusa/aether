import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
