import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { RankBadge } from "@/components/dashboard/RankBadge";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { TrendingUp, Users, Target, Star } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Hustler Dashboard" };

export default async function HustlerHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("hustler_profiles")
    .select("*, users(*)")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding/hustler");

  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*, campaigns(title)")
    .eq("hustler_id", profile.id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const acceptedCount = recentLeads?.filter((l) => l.status === "accepted").length ?? 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Welcome back, {(profile.users as { full_name: string } | null)?.full_name?.split(" ")[0] ?? "Hustler"} 👋
            </h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Keep grinding — every lead counts!
            </p>
          </div>
          <RankBadge rank={profile.rank} acceptedLeads={acceptedCount} size="md" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Earned"
            value={<ZarAmount amount={profile.total_earned} color="gold" />}
            icon={<TrendingUp size={20} />}
            iconColor="text-primary"
          />
          <StatsCard
            title="Pending Earnings"
            value={<ZarAmount amount={profile.pending_earnings} color="white" />}
            subtitle="Being processed"
            icon={<Star size={20} />}
            iconColor="text-yellow-400"
          />
          <StatsCard
            title="Leads Submitted"
            value={profile.total_leads_submitted.toString()}
            icon={<Users size={20} />}
            iconColor="text-blue-400"
          />
          <StatsCard
            title="Acceptance Rate"
            value={`${Math.round(profile.acceptance_rate)}%`}
            icon={<Target size={20} />}
            iconColor="text-success"
          />
        </div>

        {/* Rank progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Your Rank</h3>
            <Link href="/dashboard/hustler/leaderboard" className="text-primary text-sm hover:underline">
              Leaderboard →
            </Link>
          </div>
          <RankBadge
            rank={profile.rank}
            acceptedLeads={acceptedCount}
            showProgress
            size="lg"
          />
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Recent Activity</h3>
            <Link href="/dashboard/hustler/leads" className="text-primary text-sm hover:underline">
              View all →
            </Link>
          </div>
          {!recentLeads || recentLeads.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              No leads submitted yet.{" "}
              <Link href="/dashboard/hustler/campaigns" className="text-primary hover:underline">
                Browse campaigns
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{(lead.campaigns as { title: string } | null)?.title}</p>
                    <p className="text-text-secondary text-xs">{lead.contact_name}</p>
                    <RelativeTime date={lead.submitted_at} className="text-text-muted text-xs" />
                  </div>
                  <div className="flex items-center gap-3">
                    <ZarAmount amount={lead.payout_amount} color="gold" size="sm" />
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browse CTA */}
        <Link
          href="/dashboard/hustler/campaigns"
          className="card-hover flex items-center justify-between cursor-pointer border-primary/20 group"
          id="hustler-browse-cta"
        >
          <div>
            <p className="font-semibold text-white">Browse Campaigns</p>
            <p className="text-text-secondary text-sm">Find new leads to submit</p>
          </div>
          <div className="btn-primary text-sm px-5 py-2.5 group-hover:scale-105 transition-transform">
            Browse →
          </div>
        </Link>
      </main>
    </div>
  );
}
