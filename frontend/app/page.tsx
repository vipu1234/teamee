"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#fff", color: "#0F172A" }}>
      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "none",
        transition: "all 0.3s ease", padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>T</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Teamee</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" style={{ padding: "8px 16px", borderRadius: 8, color: "#475569", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>Sign In</Link>
            <Link href="/register" style={{ padding: "8px 18px", borderRadius: 8, background: "#4F46E5", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", background: "linear-gradient(180deg, #F8F7FF 0%, #fff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: 250, height: 250, background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 820, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 20, padding: "6px 14px", marginBottom: 28, fontSize: 13, color: "#4F46E5", fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, background: "#10B981", borderRadius: "50%", display: "inline-block" }} />
            Designed for high-performance AI teams
          </div>
          <h1 style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-2px" }}>
            Manage Tasks.{" "}
            <span style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ship Faster.
            </span>
          </h1>
          <p style={{ fontSize: 20, color: "#475569", lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: "0 auto 40px" }}>
            Teamee is the collaborative task manager built for modern teams. Create projects, assign work, and track progress — all in one beautiful place.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
            <Link href="/register" style={{ padding: "14px 32px", background: "#4F46E5", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 24px rgba(79,70,229,0.35)", transition: "transform 0.2s" }}>
              Start for Free →
            </Link>
            <Link href="/login" style={{ padding: "14px 28px", background: "#fff", color: "#334155", border: "1px solid #E2E8F0", borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[["500+", "Teams Using Teamee"], ["10k+", "Tasks Completed"], ["99.9%", "Uptime SLA"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#4F46E5" }}>{n}</div>
                <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>Everything your team needs</h2>
            <p style={{ fontSize: 18, color: "#64748B", marginTop: 12 }}>From task creation to deployment — Teamee covers it all</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { icon: "🔐", title: "Secure Authentication", desc: "JWT-based auth with httpOnly cookies. Role-based access control for Admins and Members." },
              { icon: "📁", title: "Project Management", desc: "Create projects, invite members by email, set priorities and deadlines. Full CRUD." },
              { icon: "✅", title: "Task Tracking", desc: "Create tasks with title, description, due date, priority. Track status from TODO to DONE." },
              { icon: "📊", title: "Analytics Dashboard", desc: "Real-time stats: total tasks, completion rate, overdue alerts, tasks per user charts." },
              { icon: "👥", title: "Team Collaboration", desc: "See all team members across projects. Assign tasks to any project member." },
              { icon: "🚀", title: "Railway Deployment", desc: "One-click deploy to Railway. Environment variables, PostgreSQL, and CI/CD ready." },
            ].map(f => (
              <div key={f.title} style={{ padding: 28, border: "1px solid #E2E8F0", borderRadius: 16, transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(79,70,229,0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#C7D2FE"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#64748B", lineHeight: 1.6, fontSize: 14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "100px 24px", background: "#F8FAFC" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, marginBottom: 60 }}>Three steps to productivity</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {[
              { step: "01", title: "Create Your Project", desc: "Sign up and create a project in seconds. You become the Admin with full control." },
              { step: "02", title: "Invite Your Team", desc: "Add members by email. Assign roles — Admin or Member. Collaborate instantly." },
              { step: "03", title: "Track & Ship", desc: "Create tasks, assign them, update status. Watch your dashboard fill with wins." },
            ].map(s => (
              <div key={s.step} style={{ padding: 32, background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#EEF2FF", marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>{s.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#64748B", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>PRICING</div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>Simple, transparent pricing</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { name: "Starter", price: "Free", desc: "Perfect for small teams", features: ["Up to 3 projects", "Up to 5 members", "Basic dashboard", "Email support"], highlighted: false },
              { name: "Pro", price: "$12/mo", desc: "For growing teams", features: ["Unlimited projects", "Unlimited members", "Advanced analytics", "Priority support", "Custom roles"], highlighted: true },
              { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Everything in Pro", "SSO & SAML", "Custom integrations", "Dedicated support", "SLA guarantee"], highlighted: false },
            ].map(plan => (
              <div key={plan.name} style={{
                padding: 32, borderRadius: 16,
                border: plan.highlighted ? "2px solid #4F46E5" : "1px solid #E2E8F0",
                background: plan.highlighted ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "#fff",
                color: plan.highlighted ? "#fff" : "#0F172A",
                position: "relative",
              }}>
                {plan.highlighted && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#10B981", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Most Popular</div>}
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 36, fontWeight: 900, margin: "12px 0 4px" }}>{plan.price}</div>
                <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>{plan.desc}</div>
                <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: plan.highlighted ? "#A5F3FC" : "#10B981" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{
                  display: "block", textAlign: "center", padding: "12px", borderRadius: 10, fontWeight: 600, fontSize: 15,
                  background: plan.highlighted ? "#fff" : "#4F46E5",
                  color: plan.highlighted ? "#4F46E5" : "#fff",
                  textDecoration: "none",
                }}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: "#fff", marginBottom: 16, letterSpacing: -1 }}>Ready to ship faster?</h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 36 }}>Join hundreds of AI teams already using Teamee to collaborate and deliver.</p>
          <Link href="/register" style={{ display: "inline-block", padding: "16px 40px", background: "#fff", color: "#4F46E5", borderRadius: 12, fontWeight: 800, fontSize: 17, textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            Start Free Today →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0F172A", color: "#94A3B8", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>T</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Teamee</span>
          </div>
          <div style={{ fontSize: 14 }}>© 2026 Teamee. Built for AI teams worldwide.</div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Support"].map(l => (
              <a key={l} href="#" style={{ color: "#64748B", textDecoration: "none", fontSize: 14 }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
