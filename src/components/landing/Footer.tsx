"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-surface-border py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-sm">G</span>
              </div>
              <span className="font-bold text-white text-lg">
                Grid<span className="text-primary">Money</span> Leads
              </span>
            </div>
            <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
              South Africa&apos;s #1 lead generation marketplace. Connecting businesses with hustle.
            </p>
            <p className="text-text-muted text-sm mt-4">
              Built in South Africa 🇿🇦
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {["How It Works", "Categories", "Pricing", "Leaderboard"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: "Sign Up", href: "/auth/signup" },
                { label: "Log In", href: "/auth/login" },
                { label: "Business Portal", href: "/dashboard/business" },
                { label: "Hustler Portal", href: "/dashboard/hustler" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-text-secondary hover:text-primary transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} GridMoney Leads. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
              <a key={l} href="#" className="text-text-muted hover:text-text-secondary text-xs transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
