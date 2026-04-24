import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, amount, interest_rate, term_months, purpose } = body;

  if (!title || !amount || !interest_rate || !term_months || !purpose) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const monthly_payment = parseFloat(
    ((amount * (interest_rate / 100 / 12)) /
      (1 - Math.pow(1 + interest_rate / 100 / 12, -term_months))).toFixed(2)
  );

  const { data, error } = await supabase
    .from("loans")
    .insert({
      borrower_id: user.id,
      title,
      description,
      amount,
      interest_rate,
      term_months,
      purpose,
      monthly_payment,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ loan: data }, { status: 201 });
}