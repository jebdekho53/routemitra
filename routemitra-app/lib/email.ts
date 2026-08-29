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
    subject: "RouteMitra — email verify karo",
    text: `Namaste!\n\nApna email verify karne ke liye ye link kholo:\n${url}\n\nYe link 24 ghante mein expire ho jaayega.\n\n— RouteMitra`,
  };
}

export function resetEmail(to: string, token: string): Mail {
  const url = `${SITE_URL}/reset?token=${token}`;
  return {
    to,
    subject: "RouteMitra — password reset",
    text: `Password reset request mila.\n\nNaya password set karne ke liye:\n${url}\n\nAgar tumne request nahi ki, is email ko ignore karo. Link 1 ghante mein expire hoga.\n\n— RouteMitra`,
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
    subject: `${route.from} → ${route.to}: fare gir gaya (₹${newPrice})`,
    text: `Jis route ko tumne watch kiya tha uska fare kam ho gaya:\n\n${route.from} → ${route.to}\nPehle: ₹${oldPrice}\nAb: ₹${newPrice}\n\nDekho: ${SITE_URL}/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}\n\n— RouteMitra`,
  };
}
