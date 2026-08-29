import { NextResponse } from "next/server";
import { dbEnabled } from "@/lib/db";
import { parse, resetSchema } from "@/lib/validation";
import { consumeToken, setPasswordHash } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function POST(request: Request) {
  if (!dbEnabled) {
    return NextResponse.json({ error: "Not available." }, { status: 503 });
  }

  const rl = await rateLimit("reset", clientIp(request), 10, "15 m");
  if (!rl.ok) {
    return NextResponse.json({ error: "Thodi der baad try karo." }, { status: 429 });
  }

  const { data, errors } = parse(resetSchema, await request.json().catch(() => ({})));
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const userId = await consumeToken(data.token, "reset").catch(() => null);
  if (!userId) {
    return NextResponse.json(
      { error: "Reset link invalid ya expire ho gaya. Naya request karo." },
      { status: 400 },
    );
  }
  await setPasswordHash(userId, await hashPassword(data.password));
  return NextResponse.json({ ok: true });
}
