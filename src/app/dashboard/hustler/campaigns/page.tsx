"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { createClient } from "@/lib/supabase/client";
import { Campaign } from "@/types/database";
import { CATEGORIES, PROVINCES } from "@/lib/constants";
import { leadsRemaining } from "@/lib/formatters";
import { Search, MapPin, Tag, Users, Filter } from "lucide-react";
import Link from "next/link";

export default function HustlerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  }

  const filtered = campaigns.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || c.category === filterCategory;
    const matchProvince = !filterProvince || c.target_province === filterProvince || c.target_province === "All Provinces";
    const matchPrice =
      !filterPrice ||
      (filterPrice === "50-100" && c.price_per_lead >= 50 && c.price_per_lead <= 100) ||
      (filterPrice === "100-250" && c.price_per_lead > 100 && c.price_per_lead <= 250) ||
      (filterPrice === "250-500" && c.price_per_lead > 250 && c.price_per_lead <= 500);
    return matchSearch && matchCategory && matchProvince && matchPrice;
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Browse Campaigns" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Browse Campaigns</h2>
          <p className="text-text-secondary text-sm">{campaigns.length} active campaigns available</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="campaign-search"
            />
          </div>
          <select className="input sm:w-44" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select className="input sm:w-44" value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)}>
            <option value="">All Provinces</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input sm:w-44" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
            <option value="">Any Price</option>
            <option value="50-100">R50 – R100</option>
            <option value="100-250">R100 – R250</option>
            <option value="250-500">R250 – R500</option>
          </select>
        </div>

        {/* Active filters count */}
        {(filterCategory || filterProvince || filterPrice) && (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-primary" />
            <span className="text-primary text-sm">{filtered.length} results</span>
            <button
              onClick={() => { setFilterCategory(""); setFilterProvince(""); setFilterPrice(""); }}
              className="text-text-secondary text-sm hover:text-white transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Campaign grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No campaigns found"
            description="Try adjusting your search filters to find more campaigns."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((campaign) => {
              const remaining = leadsRemaining(campaign.leads_needed, campaign.leads_received);
              return (
                <div key={campaign.id} className="card-hover flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-primary/20 text-primary text-xs">
                      <Tag size={10} className="mr-1" />
                      {CATEGORIES.find((c) => c.value === campaign.category)?.label || campaign.category}
                    </span>
                    <span className="badge bg-surface-border text-text-secondary text-xs">
                      <MapPin size={10} className="mr-1" />
                      {campaign.target_province}
                    </span>
                    <span className="badge bg-blue-500/20 text-blue-400 text-xs">
                      ✓ Verified Business
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-1">{campaign.title}</h3>
                    <p className="text-text-secondary text-xs line-clamp-2">{campaign.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-muted text-xs">Earn per lead</p>
                      <p className="text-primary text-2xl font-black">R{campaign.price_per_lead}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-xs">Leads needed</p>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-text-secondary" />
                        <p className="font-bold text-white">{remaining}</p>
                      </div>
                    </div>
                  </div>

                  {campaign.requirements && (
                    <div className="bg-surface-hover rounded-lg p-3">
                      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Requirements</p>
                      <p className="text-text-secondary text-xs line-clamp-2">{campaign.requirements}</p>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/hustler/campaigns/${campaign.id}`}
                    className="btn-primary w-full text-center text-sm"
                    id={`submit-lead-${campaign.id}`}
                  >
                    Submit Lead →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
