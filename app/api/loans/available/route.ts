import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const purpose    = searchParams.get("purpose");
  const minAmount  = searchParams.get("min_amount");
  const maxAmount  = searchParams.get("max_amount");
  const minRate    = searchParams.get("min_rate");
  const page       = parseInt(searchParams.get("page") ?? "1");
  const pageSize   = 20;

  let query = supabase
    .from("loans")
    .select("*, profiles!borrower_id(full_name)", { count: "exact" })
    .in("status", ["approved", "funding"])
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (purpose)   query = query.eq("purpose", purpose);
  if (minAmount) query = query.gte("amount", parseFloat(minAmount));
  if (maxAmount) query = query.lte("amount", parseFloat(maxAmount));
  if (minRate)   query = query.gte("interest_rate", parseFloat(minRate));

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    loans: data,
    pagination: { page, pageSize, total: count ?? 0, pages: Math.ceil((count ?? 0) / pageSize) },
  });
}