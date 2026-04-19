"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonCard";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { createClient } from "@/lib/supabase/client";
import { Lead } from "@/types/database";
import { maskName } from "@/lib/formatters";

const TABS = ["pending", "accepted", "rejected", "expired"] as const;

export default function HustlerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("pending");
  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("hustler_profiles").select("id").eq("user_id", user.id).single();
    if (!profile) return;
    const { data } = await supabase
      .from("leads")
      .select("*, campaigns(title)")
      .eq("hustler_id", profile.id)
      .order("submitted_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }

  const filtered = leads.filter((l) => l.status === activeTab);

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="My Leads" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">My Leads</h2>
          <p className="text-text-secondary text-sm">{leads.length} total leads submitted</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-hover p-1 rounded-xl w-fit flex-wrap">
          {TABS.map((tab) => {
            const count = leads.filter((l) => l.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab ? "bg-primary text-black" : "text-text-secondary hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab ? "bg-black/20" : "bg-surface-border"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lead cards */}
        {loading ? (
          <SkeletonTable rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={activeTab === "accepted" ? "💰" : "📭"}
            title={`No ${activeTab} leads`}
            description={
              activeTab === "pending"
                ? "Submit leads from active campaigns to start earning."
                : activeTab === "accepted"
                ? "Your accepted leads will appear here — keep submitting!"
                : `No ${activeTab} leads.`
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className={`card border transition-all ${
                  lead.status === "accepted"
                    ? "border-success/30"
                    : lead.status === "rejected"
                    ? "border-error/30"
                    : "border-surface-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{maskName(lead.contact_name)}</p>
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-text-secondary text-sm">
                      {(lead.campaigns as { title: string } | null)?.title}
                    </p>
                    <RelativeTime date={lead.submitted_at} className="text-text-muted text-xs" />
                  </div>
                  <ZarAmount
                    amount={lead.payout_amount}
                    color={lead.status === "accepted" ? "green" : lead.status === "rejected" ? "muted" : "gold"}
                    size="lg"
                  />
                </div>

                {lead.status === "accepted" && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-success text-sm font-medium">
                      ✅ Accepted! R{lead.payout_amount.toFixed(2)} added to your pending earnings.
                    </p>
                  </div>
                )}

                {lead.status === "rejected" && lead.rejection_reason && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <p className="text-error text-sm font-medium mb-1">❌ Rejection Reason:</p>
                    <p className="text-text-secondary text-sm">{lead.rejection_reason}</p>
                  </div>
                )}

                {lead.status === "expired" && (
                  <div className="bg-surface-hover rounded-lg p-3">
                    <p className="text-text-secondary text-sm">
                      ⏱️ This lead expired after 48 hours without a review.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
