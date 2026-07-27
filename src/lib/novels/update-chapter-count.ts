import { ReadingStatus, SyncStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { newChapterDelta } from "@/lib/library/rules";

export async function updateChapterCount(novelId: string, detectedCount: number, source = "manual") {
  if (!Number.isInteger(detectedCount) || detectedCount < 0) {
    throw new Error("Le nombre de chapitres doit être un entier positif.");
  }

  return db.$transaction(async (tx) => {
    const novel = await tx.novel.findUniqueOrThrow({ where: { id: novelId } });
    const previousCount = novel.chapterCount;
    if (detectedCount === previousCount) {
      await tx.chapterSyncLog.create({
        data: { novelId, source, previousCount, detectedCount, status: SyncStatus.SUCCESS },
      });
      return { previousCount, chapterCount: detectedCount, notifiedUsers: 0 };
    }

    const caughtUpReaders = detectedCount > previousCount
      ? await tx.libraryEntry.findMany({
          where: { novelId, readingStatus: ReadingStatus.UP_TO_DATE },
          select: { id: true, userId: true, lastReadChapter: true },
        })
      : [];

    await tx.novel.update({ where: { id: novelId }, data: { chapterCount: detectedCount } });
    await Promise.all(caughtUpReaders.map(async (entry) => {
      const delta = newChapterDelta(entry.lastReadChapter, detectedCount);
      if (!delta) return;
      await tx.libraryEntry.update({
        where: { id: entry.id },
        data: { readingStatus: ReadingStatus.READING, unreadChapters: delta },
      });
      await tx.notification.create({
        data: {
          userId: entry.userId,
          novelId,
          type: "NEW_CHAPTERS",
          title: `${delta} nouveau${delta > 1 ? "x" : ""} chapitre${delta > 1 ? "s" : ""}`,
          message: `${novel.title} possède désormais ${detectedCount} chapitres.`,
          chapterDelta: delta,
        },
      });
    }));
    await tx.chapterSyncLog.create({
      data: { novelId, source, previousCount, detectedCount, status: SyncStatus.SUCCESS },
    });
    return { previousCount, chapterCount: detectedCount, notifiedUsers: caughtUpReaders.length };
  });
}
