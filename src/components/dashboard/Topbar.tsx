"use client";

import { useState, useEffect } from "react";
import { Bell, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatZAR } from "@/lib/formatters";
import { Notification } from "@/types/database";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { clsx } from "clsx";
import Link from "next/link";

interface TopbarProps {
  role: "business" | "hustler";
  pageTitle: string;
  walletBalance?: number;
}

export function Topbar({ role, pageTitle, walletBalance }: TopbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchNotifications(user.id);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchNotifications(uid: string) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  }

  async function markAllRead() {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <header className="h-16 bg-surface border-b border-surface-border flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {/* Wallet balance for business */}
        {role === "business" && walletBalance !== undefined && (
          <Link
            href="/dashboard/business/wallet"
            className="hidden sm:flex items-center gap-2 bg-surface-hover border border-surface-border px-3 py-1.5 rounded-lg hover:border-primary/30 transition-colors"
          >
            <Wallet size={14} className="text-primary" />
            <span className="text-sm font-medium text-white">{formatZAR(walletBalance)}</span>
          </Link>
        )}

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-surface-hover border border-surface-border hover:border-primary/30 transition-colors"
            id="topbar-notification-btn"
          >
            <Bell size={16} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-surface border border-surface-border rounded-xl shadow-card-hover z-50 animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-surface-border">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-primary text-xs hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-secondary text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        "p-4 border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors",
                        !n.is_read && "border-l-2 border-l-primary"
                      )}
                    >
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-text-secondary text-xs mt-0.5">{n.message}</p>
                      <RelativeTime date={n.created_at} className="text-text-muted text-xs mt-1 block" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {showNotifs && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
      )}
    </header>
  );
}
