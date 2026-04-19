"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { createClient } from "@/lib/supabase/client";
import { PROVINCES } from "@/lib/constants";
import { isValidSAPhone } from "@/lib/formatters";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function HustlerSettingsPage() {
  const [form, setForm] = useState({
    full_name: "", phone: "", province: "", bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("hustler_profiles").select("*, users(*)").eq("user_id", user.id).single();
      if (profile) {
        const u = profile.users as { full_name: string; phone: string; province: string } | null;
        setForm({ full_name: u?.full_name || "", phone: u?.phone || "", province: u?.province || "", bio: profile.bio });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.phone && !isValidSAPhone(form.phone)) {
      toast.error("Please enter a valid SA phone number");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("hustler_profiles").update({ bio: form.bio }).eq("user_id", user.id);
      await supabase.from("users").update({ full_name: form.full_name, phone: form.phone, province: form.province }).eq("id", user.id);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Settings" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">Account Settings</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>
        ) : (
          <div className="card">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="label" htmlFor="hs-full_name">Full Name</label>
                <input id="hs-full_name" className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="hs-phone">SA Phone Number</label>
                <input id="hs-phone" type="tel" className="input" placeholder="082 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="hs-province">Province</label>
                <select id="hs-province" className="input" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                  <option value="">Select province</option>
                  {PROVINCES.filter(p => p !== "All Provinces").map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="hs-bio">Bio</label>
                <textarea id="hs-bio" className="input min-h-[120px] resize-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell businesses about yourself and your network..." />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2" id="hustler-settings-save-btn">
                {saving && <Loader2 size={16} className="animate-spin" />} Save Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
