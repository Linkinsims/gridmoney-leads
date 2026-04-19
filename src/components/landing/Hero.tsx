"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <span>🇿🇦</span>
            <span>Built for South Africa</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 animate-fade-in">
            Get Paid to{" "}
            <span className="text-gradient-gold">Find Customers</span>
            <br />
            for SA Businesses
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Businesses post campaigns. You find leads. You get paid.{" "}
            <span className="text-white font-medium">Simple.</span>
            <br />
            Earn R50–R500 per accepted lead from verified SA businesses.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link
              href="/auth/signup?role=hustler"
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 animate-pulse-gold"
              id="hero-start-earning-btn"
            >
              Start Earning Now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/signup?role=business"
              className="btn-outline flex items-center justify-center gap-2 text-base px-8 py-4"
              id="hero-post-campaign-btn"
            >
              Post a Campaign
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 animate-fade-in">
            {[
              { icon: <MapPin size={16} />, label: "100% SA Based" },
              { icon: <Zap size={16} />, label: "Pay Per Result" },
              { icon: <Shield size={16} />, label: "Instant Notifications" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-text-secondary text-sm"
              >
                <span className="text-primary">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats preview cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { value: "R2.4M+", label: "Paid to hustlers" },
            { value: "850+", label: "Active campaigns" },
            { value: "12,400+", label: "Leads submitted" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass border border-surface-border rounded-xl p-6 text-center hover:border-primary/30 transition-all duration-200"
            >
              <div className="text-3xl font-black text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
