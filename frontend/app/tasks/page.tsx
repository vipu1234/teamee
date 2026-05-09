"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Task { id: string; title: string; description?: string; status: string; priority: string; dueDate?: string; project: { id: string; title: string }; assignee?: { name: string }; }
interface Project { id: string; title: string; }

const STATUS_TABS = ["ALL", "TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const PRIORITY_BG: Record<string, string> = { HIGH: "#FEF2F2", MEDIUM: "#FFFBEB", LOW: "#F0FDF4" };
const PRIORITY_COLOR: Record<string, string> = { HIGH: "#B91C1C", MEDIUM: "#B45309", LOW: "#15803D" };
const STATUS_BG: Record<string, string> = { TODO: "#F1F5F9", IN_PROGRESS: "#EFF6FF", REVIEW: "#FFF7ED", COMPLETED: "#F0FDF4" };
const STATUS_COLOR: Record<string, string> = { TODO: "#475569", IN_PROGRESS: "#1D4ED8", REVIEW: "#C2410C", COMPLETED: "#15803D" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", projectId: "" });
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([api.get("/tasks"), api.get("/projects")]);
      setTasks(t.data.data); setProjects(p.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setErr("");
    try {
      await api.post("/tasks", { ...form, dueDate: form.dueDate || undefined });
      setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", projectId: "" });
      setShowCreate(false); load();
    } catch (e: any) { setErr(e.response?.data?.error || "Failed to create"); }
    finally { setCreating(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/tasks/${id}`, { status }); load();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`); load();
  };

  const filtered = activeTab === "ALL" ? tasks : tasks.filter(t => t.status === activeTab);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>My Tasks</h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you</p>
        </div>
        <button onClick={() => { setErr(""); setShowCreate(true); }} style={{ padding: "10px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + New Task
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F8FAFC", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: activeTab === tab ? "#fff" : "transparent",
            color: activeTab === tab ? "#4F46E5" : "#64748B",
            boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s",
          }}>{tab.replace("_", " ")}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 70, borderRadius: 10, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", border: "2px dashed #E2E8F0", borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
            {activeTab === "ALL" ? "No tasks yet" : `No ${activeTab.replace("_", " ")} tasks`}
          </h3>
          {projects.length === 0
            ? <p style={{ color: "#94A3B8", marginBottom: 20 }}>Create a project first</p>
            : <p style={{ color: "#94A3B8", marginBottom: 20 }}>Tasks assigned to you will appear here</p>}
          {projects.length === 0
            ? <Link href="/projects" style={{ padding: "10px 24px", background: "#4F46E5", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>Create Project</Link>
            : <button onClick={() => setShowCreate(true)} style={{ padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>+ New Task</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
            return (
              <div key={task.id} style={{ background: "#fff", border: `1px solid ${isOverdue ? "#FECACA" : "#E2E8F0"}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "box-shadow 0.15s" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 5 }}>{task.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: STATUS_BG[task.status], color: STATUS_COLOR[task.status] }}>{task.status.replace("_", " ")}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: PRIORITY_BG[task.priority], color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>📁 {task.project.title}</span>
                    {task.dueDate && <span style={{ fontSize: 12, color: isOverdue ? "#EF4444" : "#94A3B8" }}>{isOverdue ? "⚠️ " : "📅 "}{new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                    style={{ padding: "5px 8px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none", color: "#475569" }}>
                    {["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 16, padding: "4px" }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>New Task</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {err && <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>{err}</div>}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Project *</label>
                  <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                    <option value="">Select a project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Task Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Build authentication API" required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional details..." rows={2}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                      <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 24px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#475569", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "9px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", opacity: creating ? 0.7 : 1 }}>
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
