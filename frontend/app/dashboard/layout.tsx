"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface User { id: string; name: string; email: string; role: string; avatar?: string; }

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/tasks", label: "My Tasks", icon: "✅" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

function getInitials(name: string) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me").then(r => { setUser(r.data.data); setLoading(false); })
      .catch(() => { router.push("/login"); });
  }, [router]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.push("/login");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#64748B", fontSize: 14 }}>Loading workspace...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20 }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>T</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Teamee</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                background: active ? "#EEF2FF" : "transparent",
                color: active ? "#4F46E5" : "#475569",
                fontWeight: active ? 600 : 500, fontSize: 14, textDecoration: "none",
                transition: "all 0.15s ease",
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {user && (
          <div style={{ padding: 16, borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{getInitials(user.name)}</span>}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: "8px", border: "1px solid #E2E8F0", borderRadius: 8, background: "transparent", color: "#EF4444", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: "100vh", padding: "28px 32px" }}>
        {children}
      </main>
    </div>
  );
}
