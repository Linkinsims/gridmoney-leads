"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { createClient } from "@/lib/supabase/client";
import { Campaign } from "@/types/database";
import { PROVINCES, HOW_YOU_KNOW_OPTIONS, CATEGORIES } from "@/lib/constants";
import { isValidSAPhone, normalizeSAPhone, calcPlatformFee, leadsRemaining } from "@/lib/formatters";
import { toast } from "sonner";
import { Loader2, MapPin, Tag, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubmitLeadPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    contact_province: "",
    how_you_know: "",
    notes: "",
    consent: false,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchCampaign() {
      const { data } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();
      setCampaign(data);
      setLoading(false);
    }
    fetchCampaign();
  }, [campaignId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;

    if (!isValidSAPhone(form.contact_phone)) {
      toast.error("Please enter a valid SA phone number");
      return;
    }
    if (form.notes.trim().length < 50) {
      toast.error("Notes must be at least 50 characters");
      return;
    }
    if (!form.consent) {
      toast.error("Please confirm the person has consented to be contacted");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          contact_name: form.contact_name,
          contact_phone: normalizeSAPhone(form.contact_phone),
          contact_email: form.contact_email || null,
          contact_province: form.contact_province,
          notes: `[How I know them: ${form.how_you_know}]\n\n${form.notes}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Lead submitted! The business will review it within 48 hours. 🎉");
      router.push("/dashboard/hustler/leads");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit lead");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar role="hustler" pageTitle="Submit Lead" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar role="hustler" pageTitle="Campaign Not Found" />
        <main className="flex-1 p-6 text-center">
          <p className="text-text-secondary">Campaign not found or no longer active.</p>
          <Link href="/dashboard/hustler/campaigns" className="btn-primary mt-4 inline-block">
            Browse Campaigns
          </Link>
        </main>
      </div>
    );
  }

  const remaining = leadsRemaining(campaign.leads_needed, campaign.leads_received);

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Submit Lead" />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link href="/dashboard/hustler/campaigns" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Campaigns
          </Link>

          {/* Campaign summary */}
          <div className="card border-primary/20">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-primary/20 text-primary text-xs">
                <Tag size={10} className="mr-1" />
                {CATEGORIES.find((c) => c.value === campaign.category)?.label || campaign.category}
              </span>
              <span className="badge bg-surface-border text-text-secondary text-xs">
                <MapPin size={10} className="mr-1" />
                {campaign.target_province}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{campaign.title}</h2>
            <p className="text-text-secondary text-sm mb-4">{campaign.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-xs">Your payout</p>
                <p className="text-primary text-3xl font-black">R{campaign.price_per_lead}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted text-xs">Leads remaining</p>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-text-secondary" />
                  <p className="font-bold text-white text-lg">{remaining}</p>
                </div>
              </div>
            </div>

            {campaign.requirements && (
              <div className="mt-4 bg-surface-hover rounded-lg p-3">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Requirements</p>
                <p className="text-text-secondary text-sm">{campaign.requirements}</p>
              </div>
            )}
          </div>

          {/* Lead form */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-5">Lead Details</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="contact_name">Contact Name <span className="text-error">*</span></label>
                  <input id="contact_name" name="contact_name" type="text" className="input" placeholder="Full name" value={form.contact_name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label" htmlFor="contact_phone">SA Phone Number <span className="text-error">*</span></label>
                  <input id="contact_phone" name="contact_phone" type="tel" className="input" placeholder="082 123 4567" value={form.contact_phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="contact_email">Email (optional)</label>
                  <input id="contact_email" name="contact_email" type="email" className="input" placeholder="contact@email.com" value={form.contact_email} onChange={handleChange} />
                </div>
                <div>
                  <label className="label" htmlFor="contact_province">Province <span className="text-error">*</span></label>
                  <select id="contact_province" name="contact_province" className="input" value={form.contact_province} onChange={handleChange} required>
                    <option value="">Select province</option>
                    {PROVINCES.filter(p => p !== "All Provinces").map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="how_you_know">How do you know this person? <span className="text-error">*</span></label>
                <select id="how_you_know" name="how_you_know" className="input" value={form.how_you_know} onChange={handleChange} required>
                  <option value="">Select relationship</option>
                  {HOW_YOU_KNOW_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="notes">
                  Why are they a good fit? <span className="text-error">*</span>
                  <span className={`ml-2 text-xs ${form.notes.length < 50 ? "text-error" : "text-success"}`}>
                    {form.notes.length}/50 chars min
                  </span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className={`input min-h-[120px] resize-none ${form.notes.length > 0 && form.notes.length < 50 ? "input-error" : ""}`}
                  placeholder="Explain why this person is a good fit for this campaign. Include any relevant context about their needs, situation, or interest in the product/service."
                  value={form.notes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-start gap-3 bg-surface-hover rounded-lg p-4">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 accent-primary"
                  required
                />
                <label htmlFor="consent" className="text-text-secondary text-sm cursor-pointer">
                  I confirm that this person has agreed to be contacted by a business and is aware their details are being shared.{" "}
                  <span className="text-error font-medium">*</span>
                </label>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Your payout if accepted</p>
                  <ZarAmount amount={campaign.price_per_lead} color="gold" size="xl" />
                </div>
                <p className="text-text-muted text-xs text-right max-w-[160px]">
                  Paid within 48hrs of business review
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
                id="submit-lead-btn"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                Submit Lead 🎯
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
