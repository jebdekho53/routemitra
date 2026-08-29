"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return <div className="usermenu" />;

  if (!session?.user) {
    return (
      <div className="usermenu">
        <Link href="/login" className="usermenu-login">
          Login
        </Link>
      </div>
    );
  }

  const label = session.user.name || session.user.email || "Account";

  return (
    <div className="usermenu">
      <button
        type="button"
        className="usermenu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Hi, {label.split(" ")[0]} ▾
      </button>
      {open && (
        <div className="usermenu-drop" onMouseLeave={() => setOpen(false)}>
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/account" onClick={() => setOpen(false)}>
            Account
          </Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
