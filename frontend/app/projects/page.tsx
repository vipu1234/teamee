"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Project { id: string; title: string; description?: string; status: string; priority: string; deadline?: string; _count: { tasks: number }; members: { user: { id: string; name: string; avatar?: string } }[]; }

const PRIORITY_COLORS: Record<string, [string, string]> = { HIGH: ["#FEF2F2", "#B91C1C"], MEDIUM: ["#FFFBEB", "#B45309"], LOW: ["#F0FDF4", "#15803D"] };
const STATUS_COLORS: Record<string, [string, string]> = { ACTIVE: ["#EFF6FF", "#1D4ED8"], ON_HOLD: ["#FFFBEB", "#B45309"], COMPLETED: ["#F0FDF4", "#15803D"], ARCHIVED: ["#F8FAFC", "#64748B"] };

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", deadline: "" });
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try { const r = await api.get("/projects"); setProjects(r.data.data); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setErr("");
    try {
      await api.post("/projects", { ...form, deadline: form.deadline || undefined });
      setForm({ title: "", description: "", priority: "MEDIUM", deadline: "" });
      setShowCreate(false); load();
    } catch (e: any) { setErr(e.response?.data?.error || "Failed to create"); }
    finally { setCreating(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Projects</h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: "10px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + New Project
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 200, borderRadius: 12, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", border: "2px dashed #E2E8F0", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#334155", marginBottom: 8 }}>No projects yet</h3>
          <p style={{ color: "#94A3B8", marginBottom: 24 }}>Create your first project and start collaborating</p>
          <button onClick={() => setShowCreate(true)} style={{ padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>+ New Project</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {projects.map(p => {
            const [pbg, pc] = PRIORITY_COLORS[p.priority] ?? ["#F8FAFC", "#64748B"];
            const [sbg, sc] = STATUS_COLORS[p.status] ?? ["#F8FAFC", "#64748B"];
            return (
              <div key={p.id} onClick={() => router.push(`/projects/${p.id}`)} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; d.style.transform = "translateY(-2px)"; d.style.borderColor = "#C7D2FE"; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = "none"; d.style.transform = "none"; d.style.borderColor = "#E2E8F0"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", flex: 1, marginRight: 8 }}>{p.title}</h3>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: pbg, color: pc }}>{p.priority}</span>
                </div>
                {p.description && <p style={{ fontSize: 13, color: "#64748B", marginBottom: 14, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sbg, color: sc }}>{p.status}</span>
                  {p.deadline && <span style={{ fontSize: 12, color: "#94A3B8" }}>📅 {new Date(p.deadline).toLocaleDateString()}</span>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex" }}>
                    {p.members.slice(0, 4).map((m, i) => (
                      <div key={m.user.id} style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{m.user.name[0]?.toUpperCase()}</span>
                      </div>
                    ))}
                    {p.members.length > 4 && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F1F5F9", border: "2px solid #fff", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#64748B", fontWeight: 600 }}>+{p.members.length - 4}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>📋 {p._count.tasks} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>New Project</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8", lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {err && <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>{err}</div>}
                {[{ l: "Project Title *", k: "title", t: "text", ph: "e.g. Q3 AI Launch" }, { l: "Description", k: "description", t: "text", ph: "What is this project about?" }].map(f => (
                  <div key={f.k}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.l}</label>
                    {f.k === "description" ? (
                      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={f.ph} rows={3}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    ) : (
                      <input type={f.t} value={form[f.k as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} required={f.k === "title"}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                    )}
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                      <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#475569", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
