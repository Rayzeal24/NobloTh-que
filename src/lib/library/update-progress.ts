import { ReadingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { resolveReadingChapter, resolveReadingStatus } from "@/lib/library/rules";

export async function updateProgress(input: {
  userId: string;
  novelId: string;
  chapter: number;
  status?: ReadingStatus;
  rating?: number | null;
  favorite?: boolean;
}) {
  const novel = await db.novel.findUniqueOrThrow({
    where: { id: input.novelId },
    select: { chapterCount: true, publicationStatus: true },
  });
  const chapter = resolveReadingChapter(input.chapter, novel.chapterCount, input.status);
  const readingStatus = resolveReadingStatus(
    chapter,
    novel.chapterCount,
    input.status,
    novel.publicationStatus === "COMPLETED",
  );

  return db.libraryEntry.upsert({
    where: { userId_novelId: { userId: input.userId, novelId: input.novelId } },
    create: {
      userId: input.userId,
      novelId: input.novelId,
      currentChapter: chapter,
      lastReadChapter: chapter,
      lastReadAt: chapter > 0 ? new Date() : null,
      readingStatus,
      unreadChapters: Math.max(0, novel.chapterCount - chapter),
      rating: input.rating,
      favorite: input.favorite,
    },
    update: {
      currentChapter: chapter,
      lastReadChapter: chapter,
      lastReadAt: chapter > 0 ? new Date() : undefined,
      readingStatus,
      unreadChapters: Math.max(0, novel.chapterCount - chapter),
      rating: input.rating,
      favorite: input.favorite,
    },
    include: { novel: true },
  });
}
