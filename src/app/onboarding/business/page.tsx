"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PROVINCES } from "@/lib/constants";

const INDUSTRIES = [
  "Real Estate", "Solar Energy", "Insurance", "Financial Services",
  "Education", "Healthcare", "Fitness", "Legal Services",
  "Construction", "Retail", "Technology", "Other",
];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    website: "",
    description: "",
    province: "",
  });
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name || !form.industry || !form.province) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update user record
      await supabase.from("users").update({
        user_type: "business",
        province: form.province,
      }).eq("id", user.id);

      // Create business profile
      const { error } = await supabase.from("business_profiles").insert({
        user_id: user.id,
        company_name: form.company_name,
        industry: form.industry,
        website: form.website || null,
        description: form.description,
      });

      if (error) throw error;

      toast.success("Profile created! Welcome to GridMoney Leads");
      router.push("/dashboard/business");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl">🏢</span>
          <h1 className="text-2xl font-bold text-white mt-4">Set Up Your Business</h1>
          <p className="text-text-secondary mt-1 text-sm">Tell us about your business</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="company_name">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                className="input"
                placeholder="Acme Solutions (Pty) Ltd"
                value={form.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="industry">
                Industry <span className="text-error">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                className="input"
                value={form.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="province">
                Province <span className="text-error">*</span>
              </label>
              <select
                id="province"
                name="province"
                className="input"
                value={form.province}
                onChange={handleChange}
                required
              >
                <option value="">Select province</option>
                {PROVINCES.filter(p => p !== "All Provinces").map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="website">Website (optional)</label>
              <input
                id="website"
                name="website"
                type="url"
                className="input"
                placeholder="https://yourwebsite.co.za"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label" htmlFor="description">
                Business Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="input min-h-[100px] resize-none"
                placeholder="What does your business do? What services do you offer?"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="business-onboarding-submit"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Create Business Account →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
