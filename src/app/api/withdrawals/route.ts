import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MIN_WITHDRAWAL } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { amount, bank_name, account_number, account_holder, account_type } = body;

    if (!amount || !bank_name || !account_number || !account_holder) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is R${MIN_WITHDRAWAL}` }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("hustler_profiles")
      .select("id, pending_earnings")
      .eq("user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Hustler profile not found" }, { status: 404 });

    if (amount > profile.pending_earnings) {
      return NextResponse.json({ error: "Insufficient pending earnings" }, { status: 400 });
    }

    // Create withdrawal request
    const { error } = await supabase.from("withdrawal_requests").insert({
      hustler_id: profile.id,
      amount,
      bank_name,
      account_number,
      account_holder,
      account_type: account_type || "savings",
    });

    if (error) throw error;

    // Deduct from pending (move to processing)
    await supabase
      .from("hustler_profiles")
      .update({ pending_earnings: profile.pending_earnings - amount })
      .eq("id", profile.id);

    // Log transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount,
      status: "pending",
      description: `Withdrawal request to ${bank_name}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/withdrawals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
