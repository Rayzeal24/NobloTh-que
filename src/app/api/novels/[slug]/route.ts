import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const novel = await db.novel.findUnique({
    where: { slug },
    include: { author: true, genres: true },
  });
  if (!novel) return Response.json({ error: "Œuvre introuvable." }, { status: 404 });
  return Response.json(novel);
}
