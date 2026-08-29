import { NextResponse, type NextRequest } from "next/server";

// Phase 18 — HTTP Basic Auth gate for /admin and /api/admin (Next 16 "proxy"
// convention, formerly middleware). Stopgap until Phase 12 brings real
// accounts + roles. Set ADMIN_USER and ADMIN_PASSWORD; if unset, /admin is
// closed entirely (503).

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function unauthorized(body = "Authentication required") {
  return new NextResponse(body, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="RouteMitra Admin"' },
  });
}

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("Admin not configured", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized("Bad credentials");
  }
  const idx = decoded.indexOf(":");
  const gotUser = decoded.slice(0, idx);
  const gotPass = decoded.slice(idx + 1);

  if (gotUser !== user || gotPass !== pass) return unauthorized("Bad credentials");

  return NextResponse.next();
}
