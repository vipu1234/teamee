import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamee — Collaborative Team Task Manager",
  description: "A professional team task management platform. Create projects, assign tasks, and track progress with your team in real-time.",
  keywords: "task management, team collaboration, project management, productivity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
