"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Simple <span className="text-gradient-gold">Pricing</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            No subscriptions. No monthly fees. Pay only for results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Hustler card */}
          <div className="card border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold" />
            <div className="mb-6">
              <span className="text-3xl">💰</span>
              <h3 className="text-xl font-bold text-white mt-3">Hustler</h3>
              <div className="mt-2">
                <span className="text-4xl font-black text-primary">FREE</span>
                <span className="text-text-secondary ml-2">to join</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Browse all active campaigns",
                "Earn R50–R500 per accepted lead",
                "100% of campaign payout rate",
                "Real-time earnings dashboard",
                "Bank withdrawal (min R100)",
                "Rank up: Bronze → Diamond",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?role=hustler" className="btn-primary w-full text-center block" id="pricing-hustler-cta">
              Start Earning →
            </Link>
          </div>

          {/* Business card */}
          <div className="card border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
            <div className="mb-6">
              <span className="text-3xl">🏢</span>
              <h3 className="text-xl font-bold text-white mt-3">Business</h3>
              <div className="mt-2">
                <span className="text-4xl font-black text-blue-400">Pay as you go</span>
              </div>
              <p className="text-text-secondary text-sm mt-1">Per accepted lead</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Set your own price per lead (R50–R500)",
                "Only pay for accepted leads",
                "15% platform fee on each payout",
                "48-hour lead review window",
                "Campaign analytics & reporting",
                "Verified hustler network",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?role=business" className="btn-outline w-full text-center block border-blue-500 text-blue-400 hover:bg-blue-500/10" id="pricing-business-cta">
              Post a Campaign →
            </Link>
          </div>
        </div>

        {/* Fee example */}
        <div className="mt-10 max-w-2xl mx-auto card border-surface-border text-center">
          <p className="text-text-secondary text-sm mb-2">Platform fee example</p>
          <p className="text-white font-medium">
            R200 lead price → Hustler earns{" "}
            <span className="text-primary font-bold">R200</span> · Business pays{" "}
            <span className="text-white font-bold">R230</span> total (R200 + R30 fee)
          </p>
        </div>
      </div>
    </section>
  );
}
