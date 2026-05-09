"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/login", form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#F8F7FF 0%,#fff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>T</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Teamee</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>Sign in to your workspace</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { label: "Email Address", key: "email", type: "email", placeholder: "john@company.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Your password" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.placeholder} required
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#4F46E5"}
                  onBlur={e => e.target.style.borderColor = "#D1D5DB"}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ padding: "12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", marginTop: 20 }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
