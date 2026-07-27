import { PublicationStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  country: z.string().max(50).optional(),
  genre: z.string().max(50).optional(),
  status: z.nativeEnum(PublicationStatus).optional(),
  minChapters: z.coerce.number().int().min(0).optional(),
  maxChapters: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  const raw = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Filtres invalides." }, { status: 400 });
  const { q, country, genre, status, minChapters, maxChapters, page, limit } = parsed.data;
  const where: Prisma.NovelWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
    ...(country && { country }),
    ...(genre && { genres: { some: { slug: genre } } }),
    ...(status && { publicationStatus: status }),
    ...((minChapters !== undefined || maxChapters !== undefined) && {
      chapterCount: { gte: minChapters, lte: maxChapters },
    }),
  };
  const [items, total] = await db.$transaction([
    db.novel.findMany({
      where,
      include: { author: true, genres: true },
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.novel.count({ where }),
  ]);
  return Response.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}
