"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonCard";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { createClient } from "@/lib/supabase/client";
import { WithdrawalRequest } from "@/types/database";
import { SA_BANKS, MIN_WITHDRAWAL } from "@/lib/constants";
import { formatZAR } from "@/lib/formatters";
import { toast } from "sonner";
import { TrendingUp, Loader2, BanknoteIcon, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface EarningsByMonth {
  month: string;
  earned: number;
}

export default function HustlerEarningsPage() {
  const [profile, setProfile] = useState<{ total_earned: number; pending_earnings: number; withdrawn_earnings: number } | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [chartData, setChartData] = useState<EarningsByMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    account_holder: "",
    account_type: "savings",
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [hustlerProfileId, setHustlerProfileId] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: hp } = await supabase.from("hustler_profiles").select("id, total_earned, pending_earnings, withdrawn_earnings").eq("user_id", user.id).single();
    if (hp) {
      setProfile(hp);
      setHustlerProfileId(hp.id);
    }
    const { data: wr } = await supabase.from("withdrawal_requests").select("*").eq("hustler_id", hp?.id).order("requested_at", { ascending: false });
    setWithdrawals(wr || []);

    // Chart data: last 6 months
    const { data: leads } = await supabase
      .from("leads")
      .select("payout_amount, submitted_at")
      .eq("hustler_id", hp?.id)
      .eq("status", "accepted");

    if (leads) {
      const monthMap: Record<string, number> = {};
      leads.forEach((l) => {
        const month = new Date(l.submitted_at).toLocaleString("en-ZA", { month: "short", year: "2-digit" });
        monthMap[month] = (monthMap[month] || 0) + l.payout_amount;
      });
      setChartData(
        Object.entries(monthMap)
          .slice(-6)
          .map(([month, earned]) => ({ month, earned }))
      );
    }
    setLoading(false);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(withdrawForm.amount);
    if (amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${formatZAR(MIN_WITHDRAWAL)}`);
      return;
    }
    if (!profile || amount > profile.pending_earnings) {
      toast.error("Insufficient pending earnings");
      return;
    }
    setWithdrawLoading(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...withdrawForm, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Withdrawal request submitted! Processed within 3-5 business days.");
      setWithdrawModal(false);
      init();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  }

  const WITHDRAW_STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-400",
    approved: "text-blue-400",
    rejected: "text-error",
    paid: "text-success",
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="hustler" pageTitle="Earnings" />

      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Earnings</h2>

        {/* Earnings summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card border-primary/20">
            <p className="text-text-secondary text-sm mb-1">Total Earned</p>
            <ZarAmount amount={profile?.total_earned ?? 0} color="gold" size="xl" />
          </div>
          <div className="card border-yellow-500/20">
            <p className="text-text-secondary text-sm mb-1">Pending (Available)</p>
            <ZarAmount amount={profile?.pending_earnings ?? 0} color="white" size="xl" />
            <p className="text-text-muted text-xs mt-1">Ready to withdraw</p>
          </div>
          <div className="card border-success/20">
            <p className="text-text-secondary text-sm mb-1">Withdrawn</p>
            <ZarAmount amount={profile?.withdrawn_earnings ?? 0} color="green" size="xl" />
          </div>
        </div>

        {/* Withdraw button */}
        <button
          onClick={() => setWithdrawModal(true)}
          disabled={(profile?.pending_earnings ?? 0) < MIN_WITHDRAWAL}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
          id="withdraw-btn"
        >
          <BanknoteIcon size={18} />
          Withdraw Earnings
          {(profile?.pending_earnings ?? 0) < MIN_WITHDRAWAL && (
            <span className="text-xs opacity-70">(min {formatZAR(MIN_WITHDRAWAL)})</span>
          )}
        </button>

        {/* Monthly earnings chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="section-title mb-4">Monthly Earnings</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                <XAxis dataKey="month" tick={{ fill: "#A0A0A0", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A0A0A0", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}`} />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid #242424", borderRadius: "8px" }}
                  formatter={(v: number) => [formatZAR(v), "Earned"]}
                  labelStyle={{ color: "#A0A0A0" }}
                />
                <Bar dataKey="earned" fill="#F5A623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Withdrawal history */}
        <div className="card">
          <h3 className="section-title mb-4">Withdrawal History</h3>
          {loading ? (
            <SkeletonTable rows={3} />
          ) : withdrawals.length === 0 ? (
            <EmptyState icon="💸" title="No withdrawals yet" description="Your withdrawal history will appear here." />
          ) : (
            <div className="table-wrapper">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Bank</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="table-row">
                      <td className="table-td"><RelativeTime date={w.requested_at} className="text-text-secondary text-sm" /></td>
                      <td className="table-td text-white text-sm">{w.bank_name}</td>
                      <td className="table-td"><ZarAmount amount={w.amount} color="gold" size="sm" /></td>
                      <td className="table-td">
                        <span className={`font-medium text-sm ${WITHDRAW_STATUS_COLORS[w.status] || "text-white"}`}>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Clock size={14} />
          Withdrawals processed within 3-5 business days
        </div>

        {/* Withdraw modal */}
        {withdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setWithdrawModal(false)} />
            <div className="relative bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md animate-slide-up">
              <h3 className="text-lg font-bold text-white mb-1">Withdraw Earnings</h3>
              <p className="text-text-secondary text-sm mb-5">
                Available: <span className="text-primary font-bold">{formatZAR(profile?.pending_earnings ?? 0)}</span>
              </p>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="label" htmlFor="w-amount">Amount <span className="text-error">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">R</span>
                    <input id="w-amount" type="number" min={MIN_WITHDRAWAL} max={profile?.pending_earnings ?? 0} className="input pl-8" placeholder={`Min ${MIN_WITHDRAWAL}`} value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="w-bank">Bank <span className="text-error">*</span></label>
                  <select id="w-bank" className="input" value={withdrawForm.bank_name} onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })} required>
                    <option value="">Select bank</option>
                    {SA_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="w-account">Account Number <span className="text-error">*</span></label>
                  <input id="w-account" type="text" className="input" placeholder="Account number" value={withdrawForm.account_number} onChange={(e) => setWithdrawForm({ ...withdrawForm, account_number: e.target.value })} required />
                </div>
                <div>
                  <label className="label" htmlFor="w-holder">Account Holder <span className="text-error">*</span></label>
                  <input id="w-holder" type="text" className="input" placeholder="Name as it appears on bank" value={withdrawForm.account_holder} onChange={(e) => setWithdrawForm({ ...withdrawForm, account_holder: e.target.value })} required />
                </div>
                <div>
                  <label className="label" htmlFor="w-type">Account Type</label>
                  <select id="w-type" className="input" value={withdrawForm.account_type} onChange={(e) => setWithdrawForm({ ...withdrawForm, account_type: e.target.value })}>
                    <option value="savings">Savings</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setWithdrawModal(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={withdrawLoading} className="btn-primary flex-1 flex items-center justify-center gap-2" id="confirm-withdraw-btn">
                    {withdrawLoading && <Loader2 size={16} className="animate-spin" />}
                    Request Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
