import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status");
  const entries = await db.libraryEntry.findMany({
    where: {
      userId: session.user.id,
      ...(status && { readingStatus: status as never }),
    },
    include: { novel: { include: { author: true, genres: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const parsed = z.object({ novelId: z.string().cuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Œuvre invalide." }, { status: 400 });
  const entry = await db.libraryEntry.upsert({
    where: { userId_novelId: { userId: session.user.id, novelId: parsed.data.novelId } },
    create: { userId: session.user.id, novelId: parsed.data.novelId },
    update: {},
  });
  return Response.json(entry, { status: 201 });
}
