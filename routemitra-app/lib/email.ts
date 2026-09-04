// Email sending. Transport is picked by which env vars are set, in order:
//   1. SMTP_HOST + SMTP_USER + SMTP_PASS -> SMTP via nodemailer (Hostinger etc.)
//   2. RESEND_API_KEY                    -> Resend HTTP API
//   3. nothing                           -> log the email to the server console
//
// EMAIL_FROM is the visible From: on every message.

import { SITE_URL } from "@/lib/site";

const FROM = process.env.EMAIL_FROM || "RouteMitra <onboarding@resend.dev>";

interface Mail {
  to: string;
  subject: string;
  text: string;
}

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

async function sendViaSmtp(mail: Mail): Promise<void> {
  // dynamic import so nodemailer stays out of any bundle that never sends mail
  const { default: nodemailer } = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure, // true for 465, false for 587/25 (STARTTLS)
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  await transport.sendMail({
    from: FROM,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
  });
}

async function sendViaResend(mail: Mail, key: string): Promise<void> {
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
}

export async function sendEmail(mail: Mail): Promise<void> {
  try {
    if (smtpConfigured()) {
      await sendViaSmtp(mail);
      return;
    }
    const key = process.env.RESEND_API_KEY;
    if (key) {
      await sendViaResend(mail, key);
      return;
    }
    console.log(
      `\n[email:placeholder] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}\n`,
    );
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
