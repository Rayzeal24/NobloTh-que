import { PublicationStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  author: z.string().trim().min(2).max(100),
  coverUrl: z.string().url(),
  synopsis: z.string().trim().min(20).max(5000),
  country: z.string().trim().min(2).max(60),
  language: z.string().trim().min(2).max(60),
  publicationStatus: z.nativeEnum(PublicationStatus),
  chapterCount: z.number().int().min(0),
  genres: z.array(z.string().trim().min(2).max(40)).min(1).max(10),
});

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return Response.json({ error: "Accès refusé." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Informations invalides.", details: parsed.error.flatten() }, { status: 400 });
  const { author: authorName, genres: genreNames, ...data } = parsed.data;
  let slug = slugify(data.title);
  if (await db.novel.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  const authorSlug = slugify(authorName);
  const author = await db.author.upsert({ where: { slug: authorSlug }, update: { name: authorName }, create: { name: authorName, slug: authorSlug } });
  const genres = await Promise.all(genreNames.map((name) => {
    const genreSlug = slugify(name);
    return db.genre.upsert({ where: { slug: genreSlug }, update: { name }, create: { name, slug: genreSlug } });
  }));
  const novel = await db.novel.create({
    data: { ...data, slug, alternativeTitles: [], authorId: author.id, genres: { connect: genres.map(({ id }) => ({ id })) } },
    include: { author: true, genres: true },
  });
  return Response.json(novel, { status: 201 });
}
