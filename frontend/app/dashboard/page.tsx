"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Stats {
  total: number; completed: number; inProgress: number; review: number;
  todo: number; overdue: number; projectCount: number;
  tasksPerUser: { id: string; name: string; avatar: string | null; count: number; completed: number }[];
}

const STAT_CARDS = [
  { key: "total", label: "Total Tasks", icon: "📋", color: "#4F46E5", bg: "#EEF2FF" },
  { key: "completed", label: "Completed", icon: "✅", color: "#10B981", bg: "#F0FDF4" },
  { key: "inProgress", label: "In Progress", icon: "⚡", color: "#3B82F6", bg: "#EFF6FF" },
  { key: "overdue", label: "Overdue", icon: "🔴", color: "#EF4444", bg: "#FEF2F2" },
  { key: "todo", label: "To Do", icon: "📝", color: "#F59E0B", bg: "#FFFBEB" },
  { key: "projectCount", label: "Projects", icon: "📁", color: "#8B5CF6", bg: "#F5F3FF" },
];

function getInitials(name: string) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks/stats").then(r => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ height: 32, width: 200, borderRadius: 8, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16 }}>
        {[...Array(6)].map((_, i) => <div key={i} style={{ height: 100, borderRadius: 12, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
      </div>
    </div>
  );

  const completionRate = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "#64748B", fontSize: 15 }}>Here's an overview of your work</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
        {STAT_CARDS.map(c => (
          <div key={c.key} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 36, height: 36, background: c.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 18 }}>{c.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, marginBottom: 2 }}>{stats?.[c.key as keyof Omit<Stats, "tasksPerUser">] ?? 0}</div>
            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Completion Rate */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0F172A" }}>Completion Rate</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#4F46E5" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionRate / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#4F46E5" }}>{completionRate}%</div>
            </div>
            <div>
              {[["completed", "Completed", "#10B981"], ["inProgress", "In Progress", "#3B82F6"], ["review", "Review", "#F59E0B"], ["todo", "To Do", "#94A3B8"]].map(([k, l, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  <span style={{ fontSize: 13, color: "#475569" }}>{l}: <strong>{stats?.[k as keyof Omit<Stats, "tasksPerUser">] ?? 0}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0F172A" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/projects", icon: "📁", label: "View All Projects", sub: `${stats?.projectCount ?? 0} active` },
              { href: "/tasks", icon: "✅", label: "My Tasks", sub: `${stats?.total ?? 0} assigned` },
              { href: "/team", icon: "👥", label: "Team Members", sub: "Manage team" },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: "1px solid #F1F5F9", background: "#FAFAFA", textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C7D2FE"; (e.currentTarget as HTMLAnchorElement).style.background = "#EEF2FF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F1F5F9"; (e.currentTarget as HTMLAnchorElement).style.background = "#FAFAFA"; }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Per User */}
      {stats && stats.tasksPerUser.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0F172A" }}>Tasks Per Team Member</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.tasksPerUser.map(u => {
              const pct = u.count > 0 ? Math.round((u.completed / u.count) * 100) : 0;
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{getInitials(u.name)}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{u.name}</span>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{u.completed}/{u.count} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#10B981" : pct >= 50 ? "#4F46E5" : "#F59E0B", borderRadius: 3, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
