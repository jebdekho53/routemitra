// Phase 15 — Cloudflare Turnstile server verification.
// If TURNSTILE_SECRET_KEY is unset, verification is skipped (returns true) so
// signup keeps working in dev / before the key is added.

export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured -> don't block
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const json = (await res.json()) as { success: boolean };
    return json.success === true;
  } catch (err) {
    console.error("[turnstile] verify failed:", err);
    return false;
  }
}
