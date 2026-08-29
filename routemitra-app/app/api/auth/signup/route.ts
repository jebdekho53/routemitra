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
      { error: "Signup abhi available nahi (database configure nahi hai)." },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const rl = await rateLimit("signup", ip, 5, "10 m");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Bahut zyada attempts. Thodi der baad try karo." },
      { status: 429 },
    );
  }

  const { data, errors } = parse(signupSchema, await request.json().catch(() => ({})));
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const captchaOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "CAPTCHA verify nahi hua. Dobara try karo." },
      { status: 400 },
    );
  }

  if (await getUserByEmail(data.email)) {
    return NextResponse.json(
      { error: "Ye email pehle se registered hai. Login karo." },
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
