export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcPlatformFee } from "@/lib/formatters";
import { sendNewLeadNotification } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { campaign_id, contact_name, contact_phone, contact_email, contact_province, notes } = body;

    if (!campaign_id || !contact_name || !contact_phone || !contact_province || !notes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get hustler profile
    const { data: hustler } = await supabase
      .from("hustler_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!hustler) return NextResponse.json({ error: "Hustler profile not found" }, { status: 404 });

    // Get campaign
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("*, business_profiles(id, user_id, users(email, full_name))")
      .eq("id", campaign_id)
      .eq("status", "active")
      .single();

    const campaign = campaignData as any;

    if (!campaign) return NextResponse.json({ error: "Campaign not found or inactive" }, { status: 404 });

    const businessProfile = campaign.business_profiles as { id: string; user_id: string; users: { email: string; full_name: string } | null } | null;

    // Insert lead (DB will reject duplicates via unique constraint)
    const { data: lead, error } = await supabase.from("leads").insert({
      campaign_id,
      hustler_id: hustler.id,
      business_id: businessProfile?.id || campaign.business_id,
      contact_name,
      contact_phone,
      contact_email: contact_email || null,
      contact_province,
      notes,
      payout_amount: campaign.price_per_lead,
      platform_fee: calcPlatformFee(campaign.price_per_lead),
    }).select().single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This contact has already been submitted to this campaign" }, { status: 409 });
      }
      throw error;
    }

    // Increment total_leads_submitted
    await supabase
      .from("hustler_profiles")
      .update({ total_leads_submitted: (await supabase.from("hustler_profiles").select("total_leads_submitted").eq("id", hustler.id).single()).data?.total_leads_submitted! + 1 })
      .eq("id", hustler.id);

    // Send notification to business
    await supabase.from("notifications").insert({
      user_id: businessProfile?.user_id,
      title: "New lead submitted",
      message: `A new lead was submitted for "${campaign.title}"`,
      type: "new_lead",
    } as any);

    // Send email
    if (businessProfile?.users?.email) {
      sendNewLeadNotification({
        businessEmail: businessProfile.users.email,
        businessName: businessProfile.users.full_name || "Business",
        campaignTitle: campaign.title,
        leadId: lead.id,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err: unknown) {
    console.error("POST /api/leads error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
