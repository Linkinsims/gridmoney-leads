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
import { maskPhone } from "@/lib/formatters";
import { toast } from "sonner";
import { Check, X, Loader2, Phone, Mail, MapPin, MessageSquare } from "lucide-react";

const TABS = ["pending", "accepted", "rejected", "expired"] as const;

export default function BusinessLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("pending");
  const [businessId, setBusinessId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ leadId: string; reason: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: profile } = await supabase.from("business_profiles").select("id").eq("user_id", user.id).single();
    if (profile) {
      setBusinessId(profile.id);
      fetchLeads(profile.id);
    }
  }

  async function fetchLeads(bId: string) {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*, campaigns(title)")
      .eq("business_id", bId)
      .order("submitted_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }

  async function acceptLead(leadId: string) {
    setActionLoading(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/accept`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Lead accepted! Hustler has been paid. ✅");
      fetchLeads(businessId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept lead");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectLead() {
    if (!rejectModal || !rejectModal.reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(rejectModal.leadId);
    try {
      const res = await fetch(`/api/leads/${rejectModal.leadId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectModal.reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Lead rejected. Hustler has been notified.");
      setRejectModal(null);
      fetchLeads(businessId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject lead");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = leads.filter((l) => l.status === activeTab);
  const pendingCount = leads.filter((l) => l.status === "pending").length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="business" pageTitle="Leads Inbox" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Leads Inbox</h2>
          <p className="text-text-secondary text-sm">
            {pendingCount > 0
              ? `${pendingCount} lead${pendingCount > 1 ? "s" : ""} awaiting review`
              : "No pending leads"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-hover p-1 rounded-xl w-fit">
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
            icon={activeTab === "pending" ? "📬" : "📭"}
            title={`No ${activeTab} leads`}
            description={activeTab === "pending" ? "New leads will appear here when hustlers submit them." : `You have no ${activeTab} leads.`}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((lead) => (
              <div key={lead.id} className="card border-surface-border hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{lead.contact_name}</h3>
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-text-secondary text-sm">
                      Campaign: {(lead.campaigns as { title: string } | null)?.title}
                    </p>
                    <RelativeTime date={lead.submitted_at} className="text-text-muted text-xs" />
                  </div>
                  <ZarAmount amount={lead.payout_amount} color="gold" size="lg" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-text-muted flex-shrink-0" />
                    <span className="text-white">{lead.contact_phone}</span>
                  </div>
                  {lead.contact_email && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <Mail size={14} className="text-text-muted flex-shrink-0" />
                      <span className="text-white">{lead.contact_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-text-muted flex-shrink-0" />
                    <span className="text-white">{lead.contact_province}</span>
                  </div>
                </div>

                <div className="bg-surface-hover rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-text-muted flex-shrink-0 mt-0.5" />
                    <p className="text-text-secondary text-sm">{lead.notes}</p>
                  </div>
                </div>

                {lead.status === "rejected" && lead.rejection_reason && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
                    <p className="text-error text-sm">Rejection reason: {lead.rejection_reason}</p>
                  </div>
                )}

                {lead.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptLead(lead.id)}
                      disabled={actionLoading === lead.id}
                      className="btn-success flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                      id={`accept-lead-${lead.id}`}
                    >
                      {actionLoading === lead.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Accept Lead
                    </button>
                    <button
                      onClick={() => setRejectModal({ leadId: lead.id, reason: "" })}
                      disabled={actionLoading === lead.id}
                      className="btn-danger flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                      id={`reject-lead-${lead.id}`}
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setRejectModal(null)} />
            <div className="relative bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md animate-slide-up">
              <h3 className="text-lg font-bold text-white mb-2">Reject Lead</h3>
              <p className="text-text-secondary text-sm mb-4">
                Please provide a reason. The hustler will receive this feedback.
              </p>
              <textarea
                className="input min-h-[100px] resize-none mb-4"
                placeholder="e.g. Contact number was invalid, person not interested, not in target area..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                id="reject-reason-input"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button
                  onClick={rejectLead}
                  disabled={actionLoading !== null}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                  id="confirm-reject-btn"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Reject Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
