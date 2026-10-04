"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Globe,
  Sparkles
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";

export default function PwaStatsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/owner/pwa-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to load PWA stats", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <RefreshCw size={24} className="animate-spin text-[var(--accent)]" />
        <p className="text-xs text-[var(--muted)] font-medium">Loading PWA Analytics...</p>
      </div>
    );
  }

  const totals = data?.totals || {
    totalInstalls: 0,
    totalPromptsShown: 0,
    totalStandaloneSessions: 0,
    totalDismissals: 0,
    totalAccepted: 0,
    conversionRate: 0,
  };

  const platforms = data?.platforms || [];
  const browsers = data?.browsers || [];
  const recentEvents = data?.recentEvents || [];

  // Filter events
  const filteredEvents = recentEvents.filter((item) => {
    const matchesEvent = eventFilter === "all" || item.eventType === eventFilter;
    const matchesSearch =
      !search ||
      item.userName?.toLowerCase().includes(search.toLowerCase()) ||
      item.userId?.toLowerCase().includes(search.toLowerCase()) ||
      item.platform?.toLowerCase().includes(search.toLowerCase()) ||
      item.browser?.toLowerCase().includes(search.toLowerCase()) ||
      item.ip?.toLowerCase().includes(search.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / limit));
  const displayedEvents = filteredEvents.slice((page - 1) * limit, page * limit);

  const getEventBadge = (type) => {
    switch (type) {
      case "app_installed":
        return {
          label: "App Installed",
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "install_accepted":
        return {
          label: "Install Accepted",
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "prompt_shown":
        return {
          label: "Prompt Shown",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: Eye,
        };
      case "install_dismissed":
        return {
          label: "Prompt Dismissed",
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: XCircle,
        };
      case "standalone_session":
        return {
          label: "App Session Opened",
          color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          icon: Smartphone,
        };
      default:
        return {
          label: type,
          color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: Activity,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              PWA & Native App Analytics
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Monitor progressive web app installs, prompt impression conversion rates, and app usage sessions.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Installs */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Total App Installs
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Download size={15} />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            {totals.totalInstalls.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-500 font-medium">
            <CheckCircle2 size={12} />
            <span>Successful additions</span>
          </div>
        </div>

        {/* Prompt Impressions */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Prompt Impressions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye size={15} />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            {totals.totalPromptsShown.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--muted)] font-medium">
            <span>Views on install button/prompt</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              Install Conversion
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            {totals.conversionRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--accent)] font-medium">
            <Sparkles size={12} />
            <span>Accepted / Shown ratio</span>
          </div>
        </div>

        {/* Standalone Sessions */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider">
              App Launches
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Smartphone size={15} />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            {totals.totalStandaloneSessions.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 font-medium">
            <Activity size={12} />
            <span>Standalone app sessions</span>
          </div>
        </div>
      </div>

      {/* PLATFORM & BROWSER BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platforms Distribution */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3.5">
            <Smartphone size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Device Platforms
            </h3>
          </div>
          {platforms.length === 0 ? (
            <p className="text-xs text-[var(--muted)] py-4 text-center">No platform data captured yet.</p>
          ) : (
            <div className="space-y-2.5">
              {platforms.map((p) => {
                const totalPlatformEvents = platforms.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percent = Math.round((p.count / totalPlatformEvents) * 100);
                return (
                  <div key={p._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)]">{p._id || "Unknown"}</span>
                      <span className="text-[var(--muted)]">{p.count} events ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--foreground)]/[0.05] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browsers Distribution */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3.5">
            <Globe size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Browsers
            </h3>
          </div>
          {browsers.length === 0 ? (
            <p className="text-xs text-[var(--muted)] py-4 text-center">No browser data captured yet.</p>
          ) : (
            <div className="space-y-2.5">
              {browsers.map((b) => {
                const totalBrowserEvents = browsers.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percent = Math.round((b.count / totalBrowserEvents) * 100);
                return (
                  <div key={b._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)]">{b._id || "Unknown"}</span>
                      <span className="text-[var(--muted)]">{b.count} events ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--foreground)]/[0.05] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* EVENT LOG TABLE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Live Install & Interaction Activity Log
            </h3>
            <span className="text-[11px] text-[var(--muted)]">({filteredEvents.length} total)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter */}
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Events</option>
              <option value="app_installed">Installed</option>
              <option value="install_accepted">Accepted</option>
              <option value="prompt_shown">Prompt Shown</option>
              <option value="standalone_session">App Launch</option>
              <option value="install_dismissed">Dismissed</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search user, device, IP..."
                className="pl-7 pr-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]/70 bg-[var(--foreground)]/[0.02] text-[var(--muted)] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Platform & Device</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/40 text-[var(--foreground)]">
                {displayedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--muted)]">
                      No PWA events found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  displayedEvents.map((item) => {
                    const badge = getEventBadge(item.eventType);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={item._id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                            <BadgeIcon size={12} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.userName ? (
                            <div>
                              <div className="font-semibold text-[var(--foreground)]">{item.userName}</div>
                              {item.userId && (
                                <div className="text-[10px] text-[var(--muted)] font-mono">{item.userId.slice(-6)}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[var(--muted)] italic">Guest Visitor</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium">{item.platform || "Unknown"}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)]">
                          {item.browser || "Unknown"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[var(--muted)] font-mono text-[11px]">
                          {item.ip || "—"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right text-[var(--muted)]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="px-4 py-2.5 bg-[var(--foreground)]/[0.01]"
          />
        </div>
      </div>
    </div>
  );
}
