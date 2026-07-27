import { ReadingStatus } from "@prisma/client";

const terminalStatuses: ReadingStatus[] = [
  ReadingStatus.PAUSED,
  ReadingStatus.COMPLETED,
  ReadingStatus.DROPPED,
];

export function resolveReadingChapter(chapter: number, total: number, requested?: ReadingStatus) {
  if (requested === ReadingStatus.COMPLETED || requested === ReadingStatus.UP_TO_DATE) {
    return total;
  }
  return Math.max(0, Math.min(chapter, total));
}

export function resolveReadingStatus(chapter: number, total: number, requested?: ReadingStatus, publicationCompleted = false) {
  if (requested && terminalStatuses.includes(requested)) return requested;
  if (total > 0 && chapter >= total) {
    return publicationCompleted ? ReadingStatus.COMPLETED : ReadingStatus.UP_TO_DATE;
  }
  return requested ?? ReadingStatus.READING;
}

export function newChapterDelta(lastReadChapter: number, detectedCount: number) {
  return Math.max(0, detectedCount - lastReadChapter);
}
