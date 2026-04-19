import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPayFastTopup, generatePaymentReference } from "@/lib/payfast";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await request.json();
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum top-up is R100" }, { status: 400 });
    }

    const { data } = await supabase
      .from("business_profiles")
      .select("id, users(email, full_name)")
      .eq("user_id", user.id)
      .single();
      
    const profile = data as any;

    if (!profile) return NextResponse.json({ error: "Business profile not found" }, { status: 404 });

    const userInfo = profile.users as { email: string; full_name: string } | null;
    const reference = generatePaymentReference();

    // Create pending transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
      reference,
      status: "pending",
      description: `Wallet top-up - ${reference}`,
    });

    const { url, data } = buildPayFastTopup({
      userId: user.id,
      businessId: profile.id,
      amount,
      email: userInfo?.email || user.email || "",
      firstName: userInfo?.full_name?.split(" ")[0] || "Business",
      reference,
    });

    return NextResponse.json({ url, fields: data });
  } catch (err: unknown) {
    console.error("POST /api/wallet/topup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
