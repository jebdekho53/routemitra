import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { parse, forgotSchema } from "@/lib/validation";
import { getUserByEmail, issueToken } from "@/lib/auth/users";
import { sendEmail, resetEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  if (!dbEnabled) return NextResponse.json({ ok: true }); // pretend, no leak

  const rl = await rateLimit("forgot", clientIp(request), 5, "15 m");
  if (!rl.ok) {
    return NextResponse.json({ error: "Thodi der baad try karo." }, { status: 429 });
  }

  const { data, errors } = parse(forgotSchema, await request.json().catch(() => ({})));
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const user = await getUserByEmail(data.email).catch(() => null);
  if (user && user.password_hash) {
    const token = await issueToken(String(user.id), "reset", 60);
    await sendEmail(resetEmail(user.email, token));
  }
  // Always the same response — don't reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
