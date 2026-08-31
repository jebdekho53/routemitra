// Admin shell — sidebar + content area. Every /admin/* route is gated by
// HTTP Basic Auth in proxy.ts (matcher: /admin/:path*).

import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import { LEGAL_ENTITY_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · RouteMitra" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell" id="main">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin">RouteMitra</Link>
          <span>Admin</span>
        </div>
        <AdminNav />
        <div className="admin-sidebar-foot">
          <Link href="/">← Site</Link>
          <span className="muted">
            {LEGAL_ENTITY_NAME.toLowerCase() === "routemitra"
              ? "RouteMitra"
              : LEGAL_ENTITY_NAME}
          </span>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
