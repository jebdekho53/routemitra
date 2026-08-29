import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { parse, watchSchema } from "@/lib/validation";
import { addWatch, removeWatch, listWatches } from "@/lib/user-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ watches: [] });
  return NextResponse.json({ watches: await listWatches(session.user.id) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ error: "db" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { data, errors } = parse(watchSchema, body);
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  const seed = Number.isFinite(body.price) ? Math.round(body.price) : null;
  await addWatch(session.user.id, data.from, data.to, seed);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await removeWatch(session.user.id, id);
  return NextResponse.json({ ok: true });
}
