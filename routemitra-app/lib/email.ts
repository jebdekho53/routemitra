// Email sending. Placeholder-friendly:
//   - RESEND_API_KEY set -> send via Resend
//   - otherwise           -> log the email to the server console
//
// Swap in any provider (SES, Postmark, SMTP) by editing sendViaProvider().

import { SITE_URL } from "@/lib/site";

const FROM = process.env.EMAIL_FROM || "RouteMitra <onboarding@resend.dev>";

interface Mail {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `\n[email:placeholder] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}\n`,
    );
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

export function verificationEmail(to: string, token: string): Mail {
  const url = `${SITE_URL}/api/auth/verify?token=${token}`;
  return {
    to,
    subject: "RouteMitra — verify your email",
    text: `Hi,\n\nOpen this link to verify your email:\n${url}\n\nThis link expires in 24 hours.\n\n— RouteMitra`,
  };
}

export function resetEmail(to: string, token: string): Mail {
  const url = `${SITE_URL}/reset?token=${token}`;
  return {
    to,
    subject: "RouteMitra — password reset",
    text: `We received a password reset request.\n\nSet a new password here:\n${url}\n\nIf you didn’t request this, ignore this email. The link expires in 1 hour.\n\n— RouteMitra`,
  };
}

export function priceAlertEmail(
  to: string,
  route: { from: string; to: string },
  oldPrice: number,
  newPrice: number,
): Mail {
  return {
    to,
    subject: `${route.from} → ${route.to}: fare dropped (₹${newPrice})`,
    text: `A route you’re watching just got cheaper:\n\n${route.from} → ${route.to}\nWas: ₹${oldPrice}\nNow: ₹${newPrice}\n\nView: ${SITE_URL}/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}\n\n— RouteMitra`,
  };
}
