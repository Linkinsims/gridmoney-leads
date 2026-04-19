"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ZarAmount } from "@/components/dashboard/ZarAmount";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonCard";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { createClient } from "@/lib/supabase/client";
import { Transaction } from "@/types/database";
import { TOPUP_AMOUNTS } from "@/lib/constants";
import { formatZAR } from "@/lib/formatters";
import { toast } from "sonner";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";

const TRANSACTION_COLORS: Record<string, { text: string; icon: React.ReactNode; label: string }> = {
  deposit: { text: "text-success", icon: <ArrowDownLeft size={14} />, label: "Deposit" },
  payout: { text: "text-error", icon: <ArrowUpRight size={14} />, label: "Payout" },
  withdrawal: { text: "text-error", icon: <ArrowUpRight size={14} />, label: "Withdrawal" },
  refund: { text: "text-blue-400", icon: <ArrowDownLeft size={14} />, label: "Refund" },
  fee: { text: "text-orange-400", icon: <ArrowUpRight size={14} />, label: "Fee" },
};

export default function BusinessWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("business_profiles").select("wallet_balance").eq("user_id", user.id).single();
    if (profile) setBalance(profile.wallet_balance);
    const { data: txns } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setTransactions(txns || []);
    setLoading(false);
  }

  async function handleTopup() {
    const amount = selectedAmount || Number(customAmount);
    if (!amount || amount < 100) {
      toast.error("Minimum top-up amount is R100");
      return;
    }
    setTopupLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Submit PayFast form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;
      Object.entries(data.fields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Top-up failed");
      setTopupLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar role="business" pageTitle="Wallet" walletBalance={balance} />

      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Wallet</h2>

        {/* Balance card */}
        <div className="card border-primary/20 bg-gradient-to-br from-surface to-surface relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={20} className="text-primary" />
              <p className="text-text-secondary text-sm">Available Balance</p>
            </div>
            <p className="text-4xl font-black text-white mb-1">{formatZAR(balance)}</p>
            <p className="text-text-muted text-sm">Use this to fund campaigns</p>
          </div>
        </div>

        {/* Top-up */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Top Up Wallet</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {TOPUP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  selectedAmount === amount
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-surface-border text-text-secondary hover:border-primary/30"
                }`}
                id={`topup-amount-${amount}`}
              >
                {formatZAR(amount)}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="label" htmlFor="custom-amount">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">R</span>
              <input
                id="custom-amount"
                type="number"
                min={100}
                step={100}
                className="input pl-8"
                placeholder="Enter amount (min R100)"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              />
            </div>
          </div>
          <button
            onClick={handleTopup}
            disabled={topupLoading || (!selectedAmount && !customAmount)}
            className="btn-primary w-full flex items-center justify-center gap-2"
            id="topup-btn"
          >
            {topupLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Top Up via PayFast
          </button>
          <p className="text-text-muted text-xs text-center mt-3">
            Secure payment via PayFast · SSL encrypted
          </p>
        </div>

        {/* Transactions */}
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Transaction History</h3>
          {loading ? (
            <SkeletonTable rows={5} />
          ) : transactions.length === 0 ? (
            <EmptyState icon="📊" title="No transactions yet" description="Your transaction history will appear here." />
          ) : (
            <div className="table-wrapper">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Description</th>
                    <th className="table-th">Type</th>
                    <th className="table-th text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const meta = TRANSACTION_COLORS[t.type] || { text: "text-white", icon: null, label: t.type };
                    return (
                      <tr key={t.id} className="table-row">
                        <td className="table-td">
                          <RelativeTime date={t.created_at} className="text-text-secondary text-sm" />
                        </td>
                        <td className="table-td text-white text-sm">{t.description}</td>
                        <td className="table-td">
                          <span className={`badge ${meta.text} bg-current/10 flex items-center gap-1 w-fit text-xs`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className={`table-td text-right font-semibold ${meta.text}`}>
                          {t.type === "deposit" || t.type === "refund" ? "+" : "-"}{formatZAR(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
