import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    include: { novel: { select: { title: true, slug: true, coverUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json(notifications);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const parsed = z.object({ id: z.string().cuid().optional(), all: z.boolean().optional() })
    .refine((v) => v.id || v.all)
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Demande invalide." }, { status: 400 });
  await db.notification.updateMany({
    where: { userId: session.user.id, readAt: null, ...(parsed.data.id && { id: parsed.data.id }) },
    data: { readAt: new Date() },
  });
  return Response.json({ ok: true });
}
