"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PROVINCES } from "@/lib/constants";
import { isValidSAPhone } from "@/lib/formatters";

export default function HustlerOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    province: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidSAPhone(form.phone)) {
      toast.error("Please enter a valid SA phone number (e.g. 082 123 4567)");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update user record
      await supabase.from("users").update({
        user_type: "hustler",
        full_name: form.full_name,
        phone: form.phone,
        province: form.province,
      }).eq("id", user.id);

      // Create hustler profile
      const { error } = await supabase.from("hustler_profiles").insert({
        user_id: user.id,
        bio: form.bio,
      });

      if (error) throw error;

      toast.success("Profile created! Let's start earning 💰");
      router.push("/dashboard/hustler");
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
          <span className="text-4xl">💰</span>
          <h1 className="text-2xl font-bold text-white mt-4">Set Up Your Hustler Profile</h1>
          <p className="text-text-secondary mt-1 text-sm">Tell us about yourself</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="full_name">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="input"
                placeholder="Themba Dlamini"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="phone">
                SA Phone Number <span className="text-error">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                placeholder="082 123 4567"
                value={form.phone}
                onChange={handleChange}
                required
              />
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
                <option value="">Select your province</option>
                {PROVINCES.filter(p => p !== "All Provinces").map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="bio">
                Bio <span className="text-error">*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                className="input min-h-[100px] resize-none"
                placeholder="Tell businesses why you're a great hustler. How do you find leads? What networks do you have access to?"
                value={form.bio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-primary font-medium text-sm mb-1">💡 Pro tip</p>
              <p className="text-text-secondary text-xs">
                Hustlers with detailed bios get access to higher-paying campaigns. Be specific about your network and connections.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="hustler-onboarding-submit"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Start Earning →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
