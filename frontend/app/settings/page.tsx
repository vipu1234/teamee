"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User { id: string; name: string; email: string; role: string; avatar?: string; createdAt: string; }
type Tab = "profile" | "password" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({ name: "", avatar: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { api.get("/auth/me").then(r => { setUser(r.data.data); setProfile({ name: r.data.data.name, avatar: r.data.data.avatar || "" }); }); }, []);

  const showMsg = (type: "success" | "error", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.put("/auth/profile", { name: profile.name, avatar: profile.avatar || undefined }); setUser(prev => ({ ...prev!, ...r.data.data })); showMsg("success", "Profile updated!"); }
    catch (err: any) { showMsg("error", err.response?.data?.error || "Failed to update"); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { showMsg("error", "New passwords don't match"); return; }
    setSaving(true);
    try { await api.put("/auth/password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); setPasswords({ currentPassword: "", newPassword: "", confirm: "" }); showMsg("success", "Password changed!"); }
    catch (err: any) { showMsg("error", err.response?.data?.error || "Failed to change password"); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await api.post("/auth/logout"); router.push("/login"); };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "password", label: "Security", icon: "🔐" },
    { id: "account", label: "Account", icon: "🛡️" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "#64748B", fontSize: 15 }}>Manage your account preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar Tabs */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 8 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: tab === t.id ? "#EEF2FF" : "transparent",
              color: tab === t.id ? "#4F46E5" : "#475569",
              marginBottom: 2, textAlign: "left",
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 28 }}>
          {msg && <div style={{ background: msg.type === "success" ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.type === "success" ? "#BBF7D0" : "#FECACA"}`, color: msg.type === "success" ? "#15803D" : "#B91C1C", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{msg.type === "success" ? "✓" : "✕"} {msg.text}</div>}

          {tab === "profile" && (
            <form onSubmit={handleProfile}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Profile Settings</h2>
              {user && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: "#F8FAFC", borderRadius: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{user.name.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: 13, color: "#64748B" }}>{user.email}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5", display: "inline-block", marginTop: 4 }}>{user.role}</span>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { l: "Display Name", k: "name", t: "text", ph: "Your full name" },
                  { l: "Avatar URL", k: "avatar", t: "url", ph: "https://..." },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.l}</label>
                    <input type={f.t} value={profile[f.k as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
                  <input value={user?.email || ""} disabled style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#F8FAFC", color: "#94A3B8", boxSizing: "border-box" }} />
                  <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Email cannot be changed</p>
                </div>
              </div>
              <button type="submit" disabled={saving} style={{ marginTop: 20, padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {tab === "password" && (
            <form onSubmit={handlePassword}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Change Password</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { l: "Current Password", k: "currentPassword", ph: "Your current password" },
                  { l: "New Password", k: "newPassword", ph: "Min 6 characters" },
                  { l: "Confirm New Password", k: "confirm", ph: "Repeat new password" },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.l}</label>
                    <input type="password" value={passwords[f.k as keyof typeof passwords]} onChange={e => setPasswords(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} required minLength={f.k !== "currentPassword" ? 6 : 1}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={saving} style={{ marginTop: 20, padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {tab === "account" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Account Information</h2>
              <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                {user && [
                  ["User ID", user.id],
                  ["Name", user.name],
                  ["Email", user.email],
                  ["Role", user.role],
                  ["Member Since", new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ width: 130, fontSize: 13, fontWeight: 600, color: "#64748B" }}>{l}</span>
                    <span style={{ fontSize: 13, color: "#0F172A", wordBreak: "break-all" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleLogout} style={{ padding: "10px 24px", background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
