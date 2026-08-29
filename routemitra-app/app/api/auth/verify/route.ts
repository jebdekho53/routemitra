import { NextResponse } from "next/server";
import { consumeToken, markEmailVerified } from "@/lib/auth/users";
import { SITE_URL } from "@/lib/site";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const userId = await consumeToken(token, "verify").catch(() => null);
  if (!userId) {
    return NextResponse.redirect(`${SITE_URL}/login?verify=invalid`);
  }
  await markEmailVerified(userId);
  return NextResponse.redirect(`${SITE_URL}/login?verify=ok`);
}
