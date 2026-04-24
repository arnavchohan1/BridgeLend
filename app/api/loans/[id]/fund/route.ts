import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", id)
    .single();

  if (loanError || !loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  if (!["approved", "funding"].includes(loan.status))
    return NextResponse.json({ error: "Loan is not open for funding" }, { status: 422 });

  const remaining = loan.amount - loan.funded_amount;
  if (amount > remaining)
    return NextResponse.json({ error: `Max fundable amount is ${remaining}` }, { status: 422 });

  const { data: lenderProfile } = await supabase
    .from("lender_profiles")
    .select("available_budget")
    .eq("user_id", user.id)
    .single();

  if (!lenderProfile || lenderProfile.available_budget < amount)
    return NextResponse.json({ error: "Insufficient available budget" }, { status: 422 });

  const share_pct = parseFloat(((amount / loan.amount) * 100).toFixed(4));
  const newFunded = loan.funded_amount + amount;
  const newStatus = newFunded >= loan.amount ? "funded" : "funding";

  const { data: funding, error: fundingError } = await supabase
    .from("loan_fundings")
    .upsert({
      loan_id: id,
      lender_id: user.id,
      amount,
      share_pct,
      status: "confirmed",
    }, { onConflict: "loan_id,lender_id" })
    .select()
    .single();

  if (fundingError) return NextResponse.json({ error: fundingError.message }, { status: 500 });

  await supabase
    .from("loans")
    .update({ funded_amount: newFunded, status: newStatus })
    .eq("id", id);

  await supabase
    .from("lender_profiles")
    .update({ available_budget: lenderProfile.available_budget - amount })
    .eq("user_id", user.id);

  await supabase.from("transactions").insert({
    user_id: user.id,
    loan_id: id,
    funding_id: funding.id,
    type: "loan_disbursement",
    amount: -amount,
    description: `Funded ${share_pct}% of loan ${id}`,
    status: "completed",
  });

  return NextResponse.json({ funding, loan_status: newStatus }, { status: 201 });
}