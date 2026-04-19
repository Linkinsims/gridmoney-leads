"use client";

import Link from "next/link";
import { Building2, Zap } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center">
              <span className="text-black font-black">G</span>
            </div>
            <span className="font-bold text-xl text-white">
              Grid<span className="text-primary">Money</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">
            Welcome! How do you want to use GridMoney?
          </h1>
          <p className="text-text-secondary mt-2">
            Choose your account type to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Hustler */}
          <Link
            href="/onboarding/hustler"
            id="onboarding-hustler-card"
            className="card-hover group flex flex-col items-center text-center py-10 cursor-pointer border-primary/20 hover:border-primary/60"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/30 transition-colors">
              <Zap size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">I want to Earn Money</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Browse campaigns, submit leads, and earn R50–R500 per accepted lead.
            </p>
            <div className="mt-6 btn-primary px-6 py-2 text-sm">
              Join as Hustler →
            </div>
          </Link>

          {/* Business */}
          <Link
            href="/onboarding/business"
            id="onboarding-business-card"
            className="card-hover group flex flex-col items-center text-center py-10 cursor-pointer border-blue-500/20 hover:border-blue-500/60"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-colors">
              <Building2 size={32} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">I want to Find Customers</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Post campaigns and let our network of hustlers find customers for your business.
            </p>
            <div className="mt-6 border border-blue-500 text-blue-400 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500/10 transition-colors">
              Join as Business →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
