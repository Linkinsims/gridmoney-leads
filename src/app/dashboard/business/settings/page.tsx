"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/lib/supabase/client";
import { PROVINCES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BusinessSettingsPage() {
  const [form, setForm] = useState({
    company_name: "", industry: "", website: "", description: "", province: "", full_name: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("business_profiles").select("*, users(*)").eq("user_id", user.id).single();
      if (profile) {
        const u = profile.users as { full_name: string; province: string } | null;
        setForm({
          company_name: profile.company_name,
          industry: profile.industry,
          website: profile.website || "",
          description: profile.description,
          province: u?.province || "",
          full_name: u?.full_name || "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("business_profiles").update({
        company_name: form.company_name,
        industry: form.industry,
        website: form.website || null,
        description: form.description,
      }).eq("user_id", user.id);
      await supabase.from("users").update({ full_name: form.full_name, province: form.province }).eq("id", user.id);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="business" pageTitle="Settings" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">Account Settings</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : (
          <div className="card">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="label" htmlFor="s-full_name">Your Full Name</label>
                <input id="s-full_name" className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="s-company_name">Company Name</label>
                <input id="s-company_name" className="input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="s-industry">Industry</label>
                <input id="s-industry" className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="s-province">Province</label>
                <select id="s-province" className="input" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                  <option value="">Select province</option>
                  {PROVINCES.filter(p => p !== "All Provinces").map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="s-website">Website</label>
                <input id="s-website" type="url" className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourwebsite.co.za" />
              </div>
              <div>
                <label className="label" htmlFor="s-description">Business Description</label>
                <textarea id="s-description" className="input min-h-[100px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2" id="settings-save-btn">
                {saving && <Loader2 size={16} className="animate-spin" />} Save Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
