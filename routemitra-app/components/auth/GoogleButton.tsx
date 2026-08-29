"use client";

import { signIn } from "next-auth/react";

export default function GoogleButton({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      className="oauth-btn"
      onClick={() => signIn("google", { callbackUrl })}
    >
      Continue with Google
    </button>
  );
}
