import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { LayoutDashboard, Megaphone, Users, TrendingUp, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { budgetPercentage } from "@/lib/formatters";

export const metadata = { title: "Business Dashboard" };

export default async function BusinessHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*, users(*)")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding/business");

  // Fetch stats
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", profile.id)
    .order("created_at", { ascending: false });

  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];
  const totalLeads = campaigns?.reduce((sum, c) => sum + c.leads_received, 0) ?? 0;
  const totalAccepted = await supabase
    .from("leads")
    .select("id", { count: "exact" })
    .eq("business_id", profile.id)
    .eq("status", "accepted");
  const totalSubmitted = await supabase
    .from("leads")
    .select("id", { count: "exact" })
    .eq("business_id", profile.id);

  const acceptanceRate =
    totalSubmitted.count && totalSubmitted.count > 0
      ? Math.round(((totalAccepted.count ?? 0) / totalSubmitted.count) * 100)
      : 0;

  // Recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*, campaigns(title), hustler_profiles(users(full_name))")
    .eq("business_id", profile.id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col flex-1">
      <Topbar
        role="business"
        pageTitle="Dashboard"
        walletBalance={profile.wallet_balance}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Welcome back, {profile.company_name} 👋
            </h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Here&apos;s what&apos;s happening with your campaigns.
            </p>
          </div>
          <Link href="/dashboard/business/campaigns/new" className="btn-primary flex items-center gap-2 text-sm" id="dashboard-new-campaign-btn">
            <Plus size={16} />
            New Campaign
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Campaigns"
            value={activeCampaigns.length.toString()}
            icon={<Megaphone size={20} />}
            iconColor="text-blue-400"
          />
          <StatsCard
            title="Total Leads"
            value={totalLeads.toString()}
            icon={<Users size={20} />}
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Spent"
            value={<ZarAmount amount={profile.total_spent} color="gold" />}
            icon={<TrendingUp size={20} />}
            iconColor="text-success"
          />
          <StatsCard
            title="Acceptance Rate"
            value={`${acceptanceRate}%`}
            icon={<LayoutDashboard size={20} />}
            iconColor="text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active campaigns */}
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">Active Campaigns</h3>
              <Link href="/dashboard/business/campaigns" className="text-primary text-sm hover:underline">
                View all →
              </Link>
            </div>
            {activeCampaigns.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                No active campaigns. <Link href="/dashboard/business/campaigns/new" className="text-primary hover:underline">Create one</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCampaigns.slice(0, 3).map((c) => (
                  <div key={c.id} className="p-4 bg-surface-hover rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-white text-sm">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-text-secondary text-xs mb-3">
                      {c.leads_received}/{c.leads_needed} leads received
                    </p>
                    <div className="w-full bg-surface-border rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-gold"
                        style={{ width: `${budgetPercentage(c.budget_total, c.budget_spent)}%` }}
                      />
                    </div>
                    <p className="text-text-muted text-xs mt-1">
                      Budget: {Math.round(budgetPercentage(c.budget_total, c.budget_spent))}% used
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent leads */}
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">Recent Leads</h3>
              <Link href="/dashboard/business/leads" className="text-primary text-sm hover:underline">
                View all →
              </Link>
            </div>
            {!recentLeads || recentLeads.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                No leads yet. Launch a campaign to start receiving leads.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{lead.contact_name}</p>
                      <p className="text-text-secondary text-xs">{(lead.campaigns as { title: string } | null)?.title}</p>
                      <RelativeTime date={lead.submitted_at} className="text-text-muted text-xs" />
                    </div>
                    <div className="flex items-center gap-2">
                      <ZarAmount amount={lead.payout_amount} color="gold" size="sm" />
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/business/campaigns/new" className="card-hover flex items-center gap-4 cursor-pointer" id="quick-action-new-campaign">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Post New Campaign</p>
              <p className="text-text-secondary text-xs">Start receiving leads today</p>
            </div>
          </Link>
          <Link href="/dashboard/business/wallet" className="card-hover flex items-center gap-4 cursor-pointer" id="quick-action-topup">
            <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-success" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Top Up Wallet</p>
              <p className="text-text-secondary text-xs">Add funds via PayFast</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
