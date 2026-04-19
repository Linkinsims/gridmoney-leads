import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyPayFastSignature } from "@/lib/payfast";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    const { payment_status, m_payment_id, amount_gross, custom_str1, custom_str2, signature } = data;

    // Verify signature
    if (!verifyPayFastSignature(data, signature)) {
      console.error("PayFast: Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // Only process complete payments
    if (payment_status !== "COMPLETE") {
      return new Response("Payment not complete", { status: 200 });
    }

    const supabase = await createServiceClient();
    const userId = custom_str1;
    const businessId = custom_str2;
    const amount = parseFloat(amount_gross);

    if (!userId || !businessId || !amount) {
      return new Response("Missing payment data", { status: 400 });
    }

    // Update wallet balance
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("wallet_balance")
      .eq("id", businessId)
      .single();

    if (profile) {
      await supabase
        .from("business_profiles")
        .update({ wallet_balance: profile.wallet_balance + amount })
        .eq("id", businessId);
    }

    // Update transaction to completed
    await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("reference", m_payment_id)
      .eq("user_id", userId);

    // Send notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Wallet topped up! 💳",
      message: `R${amount.toFixed(2)} has been added to your wallet.`,
      type: "wallet_topped_up",
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("PayFast webhook error:", err);
    return new Response("Error", { status: 500 });
  }
}
