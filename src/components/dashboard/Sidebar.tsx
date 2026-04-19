"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard, Megaphone, Inbox, Wallet, Settings,
  Search, TrendingUp, Trophy, LogOut, ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const BUSINESS_NAV = [
  { href: "/dashboard/business", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/business/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/business/leads", label: "Leads Inbox", icon: Inbox },
  { href: "/dashboard/business/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/business/settings", label: "Settings", icon: Settings },
];

const HUSTLER_NAV = [
  { href: "/dashboard/hustler", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/hustler/campaigns", label: "Browse Campaigns", icon: Search },
  { href: "/dashboard/hustler/leads", label: "My Leads", icon: Inbox },
  { href: "/dashboard/hustler/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/dashboard/hustler/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/hustler/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  role: "business" | "hustler";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const nav = role === "business" ? BUSINESS_NAV : HUSTLER_NAV;

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-surface-border min-h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">G</span>
          </div>
          <span className="font-bold text-white">
            Grid<span className="text-primary">Money</span>
          </span>
        </Link>
        <div className="mt-3">
          <span
            className={clsx(
              "badge text-xs",
              role === "business"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-primary/20 text-primary"
            )}
          >
            {role === "business" ? "🏢 Business" : "💰 Hustler"}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== `/dashboard/${role}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? "nav-item-active" : "nav-item"}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-surface-border">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-error hover:bg-error/10 hover:text-error"
          id="sidebar-logout-btn"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
