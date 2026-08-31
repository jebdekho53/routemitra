import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { parse, signupSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { createUser, getUserByEmail, issueToken } from "@/lib/auth/users";
import { sendEmail, verificationEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  if (!dbEnabled) {
    return NextResponse.json(
      { error: "Sign-up isn’t available yet (no database configured)." },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const rl = await rateLimit("signup", ip, 5, "10 m");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const { data, errors } = parse(signupSchema, await request.json().catch(() => ({})));
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const captchaOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "CAPTCHA check failed. Please try again." },
      { status: 400 },
    );
  }

  if (await getUserByEmail(data.email)) {
    return NextResponse.json(
      { error: "That email is already registered. Please sign in." },
      { status: 409 },
    );
  }

  const user = await createUser({
    email: data.email,
    name: data.name,
    passwordHash: await hashPassword(data.password),
  });

  const token = await issueToken(String(user.id), "verify", 24 * 60);
  await sendEmail(verificationEmail(user.email, token));

  return NextResponse.json({ ok: true });
}
