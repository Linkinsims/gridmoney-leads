import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendLeadAcceptedNotification } from "@/lib/resend";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leadId = params.id;

    // Get lead with hustler user info
    const { data } = await supabase
      .from("leads")
      .select("*, hustler_profiles(user_id, users(email, full_name)), campaigns(title)")
      .eq("id", leadId)
      .single();

    const lead = data as any;

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (lead.status !== "pending") return NextResponse.json({ error: "Lead is not pending" }, { status: 400 });

    // Verify this business owns the lead
    const { data: businessData } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
      
    const businessProfile = businessData as any;

    if (!businessProfile || lead.business_id !== businessProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Run atomic payout function
    const { error } = await supabase.rpc("accept_lead" as any, { lead_id: leadId } as any);
    if (error) throw error;

    // Send notification to hustler
    const hustlerProfile = lead.hustler_profiles as { user_id: string; users: { email: string; full_name: string } | null } | null;
    if (hustlerProfile?.user_id) {
      await supabase.from("notifications").insert({
        user_id: hustlerProfile.user_id,
        title: "Lead accepted! 💰",
        message: `Your lead for "${(lead.campaigns as { title: string } | null)?.title}" was accepted. R${lead.payout_amount.toFixed(2)} added to your earnings.`,
        type: "lead_accepted",
      } as any);

      // Send email
      if (hustlerProfile.users?.email) {
        sendLeadAcceptedNotification({
          hustlerEmail: hustlerProfile.users.email,
          hustlerName: hustlerProfile.users.full_name || "Hustler",
          campaignTitle: (lead.campaigns as { title: string } | null)?.title || "",
          payoutAmount: lead.payout_amount,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PATCH /api/leads/[id]/accept error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
