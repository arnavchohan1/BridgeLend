import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { action, email, password, full_name, role } = await req.json();

  if (action === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: role ?? "borrower" } },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: data.user }, { status: 201 });
  }

  if (action === "login") {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ user: data.user, session: data.session });
  }

  if (action === "logout") {
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}