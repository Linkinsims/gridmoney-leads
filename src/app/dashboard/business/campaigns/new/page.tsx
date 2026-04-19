"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, PROVINCES, MIN_LEAD_PRICE, MAX_LEAD_PRICE, PLATFORM_FEE_RATE } from "@/lib/constants";
import { calcBusinessCharge, formatZAR } from "@/lib/formatters";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";

interface FormData {
  title: string;
  category: string;
  description: string;
  ideal_customer: string;
  requirements: string;
  price_per_lead: number;
  budget_total: number;
  target_province: string;
  expires_at: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    ideal_customer: "",
    requirements: "",
    price_per_lead: 200,
    budget_total: 2000,
    target_province: "All Provinces",
    expires_at: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price_per_lead" || name === "budget_total" ? Number(value) : value,
    }));
  }

  const leadsNeeded = form.budget_total > 0 && form.price_per_lead > 0
    ? Math.floor(form.budget_total / form.price_per_lead)
    : 0;

  const totalCostWithFees = calcBusinessCharge(form.price_per_lead) * leadsNeeded;

  async function handleLaunch() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("business_profiles")
        .select("id, wallet_balance")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Business profile not found");

      if (profile.wallet_balance < form.budget_total) {
        toast.error(`Insufficient wallet balance. You need ${formatZAR(form.budget_total)} to launch this campaign.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("campaigns").insert({
        business_id: profile.id,
        ...form,
        leads_needed: leadsNeeded,
        status: "active",
        expires_at: new Date(form.expires_at).toISOString(),
      });

      if (error) throw error;

      // Deduct budget from wallet
      await supabase
        .from("business_profiles")
        .update({ wallet_balance: profile.wallet_balance - form.budget_total })
        .eq("id", profile.id);

      // Log transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: form.budget_total,
        status: "completed",
        description: `Campaign funded: ${form.title}`,
      });

      toast.success("Campaign launched! 🚀 Your hustler network is now notified.");
      router.push("/dashboard/business/campaigns");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="business" pageTitle="Create Campaign" />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    step > s
                      ? "bg-primary text-black"
                      : step === s
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-surface-border text-text-muted"
                  }`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                <span className={`text-sm hidden sm:block ${step >= s ? "text-white" : "text-text-muted"}`}>
                  {s === 1 ? "Details" : s === 2 ? "Pricing" : "Review"}
                </span>
                {s < 3 && <div className="flex-1 h-px bg-surface-border w-8" />}
              </div>
            ))}
          </div>

          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div className="card space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Campaign Details</h2>

              <div>
                <label className="label" htmlFor="title">Campaign Title <span className="text-error">*</span></label>
                <input id="title" name="title" className="input" placeholder="e.g. Solar Panel Leads - Gauteng" value={form.title} onChange={handleChange} required />
              </div>

              <div>
                <label className="label" htmlFor="category">Category <span className="text-error">*</span></label>
                <select id="category" name="category" className="input" value={form.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="description">Campaign Description <span className="text-error">*</span></label>
                <textarea id="description" name="description" className="input min-h-[100px] resize-none" placeholder="Describe what your business does and why someone would want your product/service." value={form.description} onChange={handleChange} required />
              </div>

              <div>
                <label className="label" htmlFor="ideal_customer">Ideal Customer</label>
                <textarea id="ideal_customer" name="ideal_customer" className="input min-h-[80px] resize-none" placeholder="Describe your perfect customer: age range, income level, location, pain points..." value={form.ideal_customer} onChange={handleChange} />
              </div>

              <div>
                <label className="label" htmlFor="requirements">Lead Requirements</label>
                <textarea id="requirements" name="requirements" className="input min-h-[80px] resize-none" placeholder="e.g. Must be a homeowner, must be in Gauteng, must be interested in saving on electricity bills" value={form.requirements} onChange={handleChange} />
              </div>

              <button
                onClick={() => {
                  if (!form.title || !form.category || !form.description) {
                    toast.error("Please fill in all required fields");
                    return;
                  }
                  setStep(2);
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Next: Pricing <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="card space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Pricing & Budget</h2>

              <div>
                <label className="label">Price Per Lead: <span className="text-primary font-bold">{formatZAR(form.price_per_lead)}</span></label>
                <input
                  type="range"
                  name="price_per_lead"
                  min={MIN_LEAD_PRICE}
                  max={MAX_LEAD_PRICE}
                  step={50}
                  value={form.price_per_lead}
                  onChange={handleChange}
                  className="w-full accent-primary mt-2"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>{formatZAR(MIN_LEAD_PRICE)}</span>
                  <span>{formatZAR(MAX_LEAD_PRICE)}</span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="budget_total">Total Budget <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">R</span>
                  <input id="budget_total" name="budget_total" type="number" min={form.price_per_lead} step={100} className="input pl-8" value={form.budget_total} onChange={handleChange} required />
                </div>
                {leadsNeeded > 0 && (
                  <p className="text-text-secondary text-xs mt-1.5">
                    = <span className="text-white font-medium">{leadsNeeded} leads</span> needed
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="target_province">Target Province</label>
                <select id="target_province" name="target_province" className="input" value={form.target_province} onChange={handleChange}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="expires_at">Campaign Expiry Date <span className="text-error">*</span></label>
                <input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  className="input"
                  value={form.expires_at}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {/* Fee info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-text-secondary text-xs">
                  + {Math.round(PLATFORM_FEE_RATE * 100)}% platform fee per accepted lead.{" "}
                  Max total charge: <span className="text-primary font-medium">{formatZAR(totalCostWithFees)}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => {
                    if (!form.expires_at || form.budget_total < form.price_per_lead) {
                      toast.error("Please fill in all required fields");
                      return;
                    }
                    setStep(3);
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Review Campaign <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Review Your Campaign</h2>

              <div className="space-y-4">
                {[
                  { label: "Title", value: form.title },
                  { label: "Category", value: CATEGORIES.find(c => c.value === form.category)?.label || form.category },
                  { label: "Province", value: form.target_province },
                  { label: "Price Per Lead", value: formatZAR(form.price_per_lead) },
                  { label: "Total Budget", value: formatZAR(form.budget_total) },
                  { label: "Leads Needed", value: leadsNeeded.toString() },
                  { label: "Expires", value: new Date(form.expires_at).toLocaleDateString("en-ZA") },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-surface-border last:border-0">
                    <span className="text-text-secondary text-sm">{row.label}</span>
                    <span className="text-white font-medium text-sm">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-surface-hover rounded-xl p-4">
                <p className="text-text-secondary text-sm mb-1">Wallet Deduction on Launch</p>
                <p className="text-primary text-2xl font-bold">{formatZAR(form.budget_total)}</p>
                <p className="text-text-muted text-xs mt-1">+ {formatZAR(calcBusinessCharge(form.price_per_lead) - form.price_per_lead)} platform fee per accepted lead</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex items-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 animate-pulse-gold"
                  id="campaign-launch-btn"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Fund & Launch Campaign 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
