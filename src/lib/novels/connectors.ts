export type ChapterSnapshot = {
  externalId: string;
  chapterCount: number;
  checkedAt: Date;
};

export interface ChapterSourceConnector {
  readonly name: string;
  fetchChapterCount(externalId: string): Promise<ChapterSnapshot>;
}

export type ConnectorResult =
  | { ok: true; previousCount: number; chapterCount: number; notifiedUsers: number }
  | { ok: false; error: string };
