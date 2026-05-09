"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface TeamMember { id: string; name: string; email: string; avatar?: string; role: string; createdAt: string; projects: { id: string; title: string; memberRole: string }[]; }

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/team").then(r => { setMembers(r.data.data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));
  const admins = members.filter(m => m.projects.some(p => p.memberRole === "ADMIN")).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Team</h1>
        <p style={{ color: "#64748B", fontSize: 15 }}>All members across your projects</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Members", value: members.length, icon: "👥", bg: "#EEF2FF", color: "#4F46E5" },
          { label: "Admins", value: admins, icon: "🛡️", bg: "#F5F3FF", color: "#7C3AED" },
          { label: "Active Projects", value: new Set(members.flatMap(m => m.projects.map(p => p.id))).size, icon: "📁", bg: "#F0FDF4", color: "#15803D" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20 }}>
            <div style={{ width: 36, height: 36, background: s.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..." style={{ width: "100%", maxWidth: 380, padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#4F46E5"}
          onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 160, borderRadius: 12, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", border: "2px dashed #E2E8F0", borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8 }}>No members found</h3>
          <p style={{ color: "#94A3B8" }}>Add members to your projects first</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.map(m => {
            const isAdmin = m.projects.some(p => p.memberRole === "ADMIN");
            return (
              <div key={m.id} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.avatar ? <img src={m.avatar} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{m.name.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: isAdmin ? "#EEF2FF" : "#F8FAFC", color: isAdmin ? "#4F46E5" : "#64748B", flexShrink: 0 }}>
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
                {m.projects.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Projects</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {m.projects.slice(0, 3).map(p => (
                        <span key={p.id} style={{ padding: "3px 8px", background: "#F1F5F9", borderRadius: 20, fontSize: 11, color: "#475569" }}>{p.title}</span>
                      ))}
                      {m.projects.length > 3 && <span style={{ padding: "3px 8px", background: "#F1F5F9", borderRadius: 20, fontSize: 11, color: "#94A3B8" }}>+{m.projects.length - 3} more</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
