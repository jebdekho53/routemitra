// Phase 21 — POST /api/feedback
// Accepts { kind, message, email?, page? }. Rate-limited per IP. Stores in the
// `feedback` table (or logs to console with no DB) and best-effort emails the
// support inbox.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parse, feedbackSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { createFeedback } from "@/lib/feedback";
import { sendEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/site";

export async function POST(request: Request) {
  const rl = await rateLimit("feedback", clientIp(request), 5, "10 m");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Bahut zyada messages. Thodi der baad try karo." },
      { status: 429, headers: { "retry-after": "120" } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { data, errors } = parse(feedbackSchema, body);
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const session = await auth().catch(() => null);
  const email = data.email || session?.user?.email || null;

  try {
    await createFeedback({
      kind: data.kind,
      message: data.message,
      email,
      page: data.page ?? null,
      userId: session?.user?.id ?? null,
      userAgent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
    });
  } catch (err) {
    console.error("[feedback] save failed:", err);
    return NextResponse.json(
      { error: "Save nahi ho paya, thodi der baad try karo." },
      { status: 500 },
    );
  }

  // notify support (no-op -> console when RESEND_API_KEY is unset)
  sendEmail({
    to: SUPPORT_EMAIL,
    subject: `[RouteMitra] ${data.kind} feedback`,
    text: `Kind:  ${data.kind}\nFrom:  ${email ?? "anonymous"}\nPage:  ${
      data.page ?? "-"
    }\nUser:  ${session?.user?.id ?? "-"}\n\n${data.message}\n`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
