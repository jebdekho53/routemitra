import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { parse, watchSchema } from "@/lib/validation";
import { addFavourite, removeFavourite, listFavourites } from "@/lib/user-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ favourites: [] });
  return NextResponse.json({ favourites: await listFavourites(session.user.id) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ error: "db" }, { status: 503 });

  const { data, errors } = parse(watchSchema, await request.json().catch(() => ({})));
  if (errors) return NextResponse.json({ errors }, { status: 400 });

  await addFavourite(session.user.id, data.from, data.to);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "auth" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await removeFavourite(session.user.id, id);
  return NextResponse.json({ ok: true });
}
