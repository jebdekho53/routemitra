"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/traffic", label: "Traffic" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/system", label: "System" },
];

export default function AdminNav() {
  const pathname = usePathname() || "/admin";
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
