"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { createClient } from "@/lib/supabase/client";
import { Campaign, CampaignStatus } from "@/types/database";
import { Plus, Edit, Pause, Play, BarChart3, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { budgetPercentage } from "@/lib/formatters";
import { toast } from "sonner";

const TABS: { label: string; value: "all" | CampaignStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Draft", value: "draft" },
];

export default function BusinessCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | CampaignStatus>("all");
  const supabase = createClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("business_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("business_id", profile.id)
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
    setLoading(false);
  }

  async function togglePause(campaign: Campaign) {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("campaigns")
      .update({ status: newStatus })
      .eq("id", campaign.id);

    if (error) {
      toast.error("Failed to update campaign");
    } else {
      toast.success(`Campaign ${newStatus}`);
      fetchCampaigns();
    }
  }

  const filtered = activeTab === "all"
    ? campaigns
    : campaigns.filter((c) => c.status === activeTab);

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="business" pageTitle="Campaigns" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">My Campaigns</h2>
            <p className="text-text-secondary text-sm">{campaigns.length} total campaigns</p>
          </div>
          <Link href="/dashboard/business/campaigns/new" className="btn-primary flex items-center gap-2 text-sm" id="campaigns-new-btn">
            <Plus size={16} />
            Create Campaign
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-hover p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.value
                  ? "bg-primary text-black"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campaigns grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No campaigns found"
            description="Create your first campaign to start receiving leads from our hustler network."
            action={
              <Link href="/dashboard/business/campaigns/new" className="btn-primary text-sm">
                Create Campaign
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((campaign) => (
              <div key={campaign.id} className="card-hover flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">{campaign.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-primary/20 text-primary text-xs">
                        <Tag size={10} className="mr-1" />
                        {campaign.category}
                      </span>
                      <span className="badge bg-surface-border text-text-secondary text-xs">
                        <MapPin size={10} className="mr-1" />
                        {campaign.target_province}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={campaign.status} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-xs">Price per lead</p>
                    <ZarAmount amount={campaign.price_per_lead} color="gold" size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary text-xs">Leads</p>
                    <p className="font-bold text-white">
                      {campaign.leads_received}/{campaign.leads_needed}
                    </p>
                  </div>
                </div>

                {/* Budget progress */}
                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Budget used</span>
                    <span>{Math.round(budgetPercentage(campaign.budget_total, campaign.budget_spent))}%</span>
                  </div>
                  <div className="w-full bg-surface-border rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-gold transition-all"
                      style={{ width: `${budgetPercentage(campaign.budget_total, campaign.budget_spent)}%` }}
                    />
                  </div>
                </div>

                <RelativeTime date={campaign.created_at} className="text-text-muted text-xs" />

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-surface-border">
                  <Link
                    href={`/dashboard/business/campaigns/${campaign.id}`}
                    className="flex-1 btn-ghost text-xs text-center flex items-center justify-center gap-1"
                  >
                    <BarChart3 size={14} />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/business/campaigns/${campaign.id}/edit`}
                    className="flex-1 btn-ghost text-xs text-center flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                  {(campaign.status === "active" || campaign.status === "paused") && (
                    <button
                      onClick={() => togglePause(campaign)}
                      className="flex-1 btn-ghost text-xs flex items-center justify-center gap-1"
                    >
                      {campaign.status === "active" ? (
                        <><Pause size={14} /> Pause</>
                      ) : (
                        <><Play size={14} /> Resume</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
