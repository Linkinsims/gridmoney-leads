import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendLeadRejectedNotification } from "@/lib/resend";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reason } = await request.json();
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const leadId = params.id;

    const { data: lead } = await supabase
      .from("leads")
      .select("*, hustler_profiles(user_id, users(email, full_name)), campaigns(title)")
      .eq("id", leadId)
      .single();

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (lead.status !== "pending") return NextResponse.json({ error: "Lead is not pending" }, { status: 400 });

    const { data: businessProfile } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!businessProfile || lead.business_id !== businessProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reject the lead
    const { error } = await supabase
      .from("leads")
      .update({ status: "rejected", rejection_reason: reason.trim(), reviewed_at: new Date().toISOString() })
      .eq("id", leadId);

    if (error) throw error;

    // Notify hustler
    const hustlerProfile = lead.hustler_profiles as { user_id: string; users: { email: string; full_name: string } | null } | null;
    if (hustlerProfile?.user_id) {
      await supabase.from("notifications").insert({
        user_id: hustlerProfile.user_id,
        title: "Lead not accepted",
        message: `Your lead for "${(lead.campaigns as { title: string } | null)?.title}" was not accepted. Reason: ${reason}`,
        type: "lead_rejected",
      });

      if (hustlerProfile.users?.email) {
        sendLeadRejectedNotification({
          hustlerEmail: hustlerProfile.users.email,
          hustlerName: hustlerProfile.users.full_name || "Hustler",
          campaignTitle: (lead.campaigns as { title: string } | null)?.title || "",
          rejectionReason: reason,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PATCH /api/leads/[id]/reject error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
