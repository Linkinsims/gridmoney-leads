import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { RankBadge } from "@/components/dashboard/RankBadge";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { redirect } from "next/navigation";
import { HustlerRank } from "@/types/database";

export const metadata = { title: "Leaderboard" };

interface LeaderEntry {
  id: string;
  rank: HustlerRank;
  total_earned: number;
  acceptance_rate: number;
  total_leads_submitted: number;
  users: { full_name: string } | null;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: leaders } = await supabase
    .from("hustler_profiles")
    .select("id, rank, total_earned, acceptance_rate, total_leads_submitted, users(full_name)")
    .order("total_earned", { ascending: false })
    .limit(50);

  const { data: myProfile } = await supabase
    .from("hustler_profiles")
    .select("id, rank, total_earned, acceptance_rate, total_leads_submitted, users(full_name)")
    .eq("user_id", user.id)
    .single();

  const myRank = leaders?.findIndex((l) => l.id === myProfile?.id) ?? -1;

  const TROPHY_ICONS = ["🥇", "🥈", "🥉"];

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Leaderboard" />

      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Hustler Leaderboard</h2>
          <p className="text-text-secondary text-sm">Top earners this month</p>
        </div>

        {/* Your position */}
        {myRank >= 0 && myProfile && (
          <div className="card border-primary/30 bg-primary/5">
            <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">Your Position</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-primary">#{myRank + 1}</span>
                <div>
                  <p className="font-semibold text-white">{(myProfile.users as { full_name: string } | null)?.full_name}</p>
                  <RankBadge rank={myProfile.rank} size="sm" />
                </div>
              </div>
              <ZarAmount amount={myProfile.total_earned} color="gold" size="lg" />
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-wrapper">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  <th className="table-th w-12">#</th>
                  <th className="table-th">Hustler</th>
                  <th className="table-th">Rank</th>
                  <th className="table-th text-center">Leads</th>
                  <th className="table-th text-center">Rate</th>
                  <th className="table-th text-right">Earned</th>
                </tr>
              </thead>
              <tbody>
                {leaders?.map((hustler, index) => {
                  const isMe = hustler.id === myProfile?.id;
                  return (
                    <tr
                      key={hustler.id}
                      className={`table-row ${isMe ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    >
                      <td className="table-td">
                        <span className="text-lg">
                          {index < 3 ? TROPHY_ICONS[index] : <span className="text-text-secondary text-sm">#{index + 1}</span>}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`font-medium text-sm ${isMe ? "text-primary" : "text-white"}`}>
                          {(hustler.users as { full_name: string } | null)?.full_name || "Anonymous"}
                          {isMe && <span className="ml-2 text-xs text-primary/70">(You)</span>}
                        </span>
                      </td>
                      <td className="table-td">
                        <RankBadge rank={hustler.rank} size="sm" />
                      </td>
                      <td className="table-td text-center text-white text-sm">
                        {hustler.total_leads_submitted}
                      </td>
                      <td className="table-td text-center text-sm">
                        <span className={hustler.acceptance_rate >= 60 ? "text-success" : "text-text-secondary"}>
                          {Math.round(hustler.acceptance_rate)}%
                        </span>
                      </td>
                      <td className="table-td text-right">
                        <ZarAmount amount={hustler.total_earned} color="gold" size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
