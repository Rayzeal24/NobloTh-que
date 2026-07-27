import { PublicationStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateChapterCount } from "@/lib/novels/update-chapter-count";

const schema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  author: z.string().trim().min(2).max(100).optional(),
  coverUrl: z.string().url().optional(),
  synopsis: z.string().trim().min(20).max(5000).optional(),
  country: z.string().trim().min(2).max(60).optional(),
  language: z.string().trim().min(2).max(60).optional(),
  publicationStatus: z.nativeEnum(PublicationStatus).optional(),
  chapterCount: z.number().int().min(0).optional(),
  genres: z.array(z.string().trim().min(2).max(40)).min(1).max(10).optional(),
});
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return Response.json({ error: "Accès refusé." }, { status: 403 });
  const [parsed, { id }] = await Promise.all([schema.safeParseAsync(await request.json().catch(() => null)), params]);
  if (!parsed.success) return Response.json({ error: "Informations invalides." }, { status: 400 });
  const { chapterCount, author, genres, ...fields } = parsed.data;
  if (chapterCount !== undefined) await updateChapterCount(id, chapterCount, "manual");
  const data: Prisma.NovelUpdateInput = { ...fields };
  if (author) {
    const slug = slugify(author);
    data.author = { connect: { id: (await db.author.upsert({ where: { slug }, update: { name: author }, create: { slug, name: author } })).id } };
  }
  if (genres) {
    const records = await Promise.all(genres.map((name) => {
      const slug = slugify(name);
      return db.genre.upsert({ where: { slug }, update: { name }, create: { slug, name } });
    }));
    data.genres = { set: records.map(({ id: genreId }) => ({ id: genreId })) };
  }
  const novel = await db.novel.update({ where: { id }, data, include: { author: true, genres: true } });
  return Response.json(novel);
}
