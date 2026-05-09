"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Member { id: string; role: string; user: { id: string; name: string; email: string; avatar?: string; }; }
interface Task { id: string; title: string; description?: string; status: string; priority: string; dueDate?: string; assignee?: { id: string; name: string; avatar?: string; }; }
interface Project { id: string; title: string; description?: string; status: string; priority: string; deadline?: string; ownerId: string; members: Member[]; tasks: Task[]; }

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const PRIORITY_COLORS: Record<string, string> = { HIGH: "#B91C1C", MEDIUM: "#B45309", LOW: "#15803D" };
const STATUS_COLORS: Record<string, [string, string]> = { TODO: ["#F1F5F9", "#475569"], IN_PROGRESS: ["#EFF6FF", "#1D4ED8"], REVIEW: ["#FFF7ED", "#C2410C"], COMPLETED: ["#F0FDF4", "#15803D"] };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [proj, me] = await Promise.all([api.get(`/projects/${id}`), api.get("/auth/me")]);
      setProject(proj.data.data); setCurrentUserId(me.data.data.id);
      const myMembership = proj.data.data.members.find((m: Member) => m.user.id === me.data.data.id);
      setIsAdmin(myMembership?.role === "ADMIN");
    } catch { router.push("/projects"); } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (taskId: string, status: string) => {
    await api.put(`/tasks/${taskId}`, { status }); load();
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault(); setAdding(true); setErr("");
    try { await api.post(`/projects/${id}/members`, { email: memberEmail }); setMemberEmail(""); setShowAddMember(false); load(); }
    catch (err: any) { setErr(err.response?.data?.error || "Failed to add member"); }
    finally { setAdding(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try { await api.delete(`/projects/${id}/members/${memberId}`); load(); } catch {}
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault(); setAdding(true); setErr("");
    try {
      await api.post("/tasks", { ...taskForm, projectId: id, dueDate: taskForm.dueDate || undefined, assigneeId: taskForm.assigneeId || undefined });
      setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
      setShowAddTask(false); load();
    } catch (err: any) { setErr(err.response?.data?.error || "Failed to create task"); }
    finally { setAdding(false); }
  };

  if (loading || !project) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}><div style={{ fontSize: 14, color: "#64748B" }}>Loading project...</div></div>;

  const completed = project.tasks.filter(t => t.status === "COMPLETED").length;
  const progress = project.tasks.length > 0 ? Math.round((completed / project.tasks.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => router.push("/projects")} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>← Back to Projects</button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{project.title}</h1>
            {project.description && <p style={{ color: "#64748B", fontSize: 15 }}>{project.description}</p>}
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {isAdmin && <button onClick={() => { setErr(""); setShowAddMember(true); }} style={{ padding: "9px 16px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#475569", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>+ Add Member</button>}
            <button onClick={() => { setErr(""); setShowAddTask(true); }} style={{ padding: "9px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Add Task</button>
          </div>
        </div>
        {/* Progress */}
        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#64748B" }}>
            <span>{completed}/{project.tasks.length} tasks completed</span>
            <span style={{ fontWeight: 700, color: "#4F46E5" }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#4F46E5,#7C3AED)", borderRadius: 3, transition: "width 0.6s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Tasks */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            Tasks ({project.tasks.length})
          </div>
          {project.tasks.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14 }}>No tasks yet. Add the first one!</div>
            </div>
          ) : (
            <div>
              {project.tasks.map(task => {
                const [sbg, sc] = STATUS_COLORS[task.status] ?? ["#F8FAFC", "#64748B"];
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                return (
                  <div key={task.id} style={{ padding: "14px 20px", borderBottom: "1px solid #F8FAFC", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{task.title}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 7px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sbg, color: sc }}>{task.status.replace("_", " ")}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                        {task.assignee && <span style={{ fontSize: 11, color: "#94A3B8" }}>→ {task.assignee.name}</span>}
                        {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? "#EF4444" : "#94A3B8" }}>{isOverdue ? "⚠️ " : "📅 "}{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                      style={{ padding: "5px 8px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#475569", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, alignSelf: "start" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            Members ({project.members.length})
          </div>
          <div style={{ padding: "8px 0" }}>
            {project.members.map(m => (
              <div key={m.id} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{m.user.name[0]?.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.user.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.user.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: m.role === "ADMIN" ? "#EEF2FF" : "#F8FAFC", color: m.role === "ADMIN" ? "#4F46E5" : "#64748B" }}>{m.role}</span>
                  {isAdmin && m.user.id !== currentUserId && (
                    <button onClick={() => handleRemoveMember(m.user.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13, padding: 2 }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add Member</h2>
              <button onClick={() => setShowAddMember(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>×</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div style={{ padding: "16px 24px" }}>
                {err && <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{err}</div>}
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@company.com" required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ padding: "0 24px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddMember(false)} style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#475569", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={adding} style={{ padding: "9px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease-out" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add Task</h2>
              <button onClick={() => setShowAddTask(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8" }}>×</button>
            </div>
            <form onSubmit={handleAddTask}>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {err && <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>{err}</div>}
                {[{ l: "Task Title *", k: "title", t: "text", ph: "e.g. Design API schema" }, { l: "Description", k: "description", t: "text", ph: "Optional..." }].map(f => (
                  <div key={f.k}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.l}</label>
                    <input type={f.t} value={taskForm[f.k as keyof typeof taskForm]} onChange={e => setTaskForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} required={f.k === "title"}
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Priority</label>
                    <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                      <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Assign To</label>
                  <select value={taskForm.assigneeId} onChange={e => setTaskForm(p => ({ ...p, assigneeId: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}>
                    <option value="">Self (default)</option>
                    {project.members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding: "0 24px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAddTask(false)} style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#475569", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={adding} style={{ padding: "9px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                  {adding ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
