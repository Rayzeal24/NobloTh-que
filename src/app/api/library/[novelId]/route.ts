import { ReadingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateProgress } from "@/lib/library/update-progress";

const schema = z.object({
  chapter: z.number().int().min(0).optional(),
  status: z.nativeEnum(ReadingStatus).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  favorite: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ novelId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const { novelId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Progression invalide." }, { status: 400 });
  const existing = await db.libraryEntry.findUnique({
    where: { userId_novelId: { userId: session.user.id, novelId } },
  });
  const entry = await updateProgress({
    userId: session.user.id,
    novelId,
    chapter: parsed.data.chapter ?? existing?.currentChapter ?? 0,
    status: parsed.data.status ?? existing?.readingStatus,
    rating: parsed.data.rating === undefined ? existing?.rating : parsed.data.rating,
    favorite: parsed.data.favorite ?? existing?.favorite,
  });
  revalidateLibraryPages();
  return Response.json(entry);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ novelId: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const { novelId } = await params;
  await db.libraryEntry.deleteMany({ where: { userId: session.user.id, novelId } });
  revalidateLibraryPages();
  return new Response(null, { status: 204 });
}

function revalidateLibraryPages() {
  revalidatePath("/app");
  revalidatePath("/app/profil");
  revalidatePath("/app/bibliotheque");
  revalidatePath("/app/romans/[slug]", "page");
}
