import { ReadingStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { newChapterDelta, resolveReadingChapter, resolveReadingStatus } from "./rules";

describe("règles de progression", () => {
  it("complète la progression avec un statut terminé ou à jour", () => {
    expect(resolveReadingChapter(0, 807, ReadingStatus.COMPLETED)).toBe(807);
    expect(resolveReadingChapter(100, 807, ReadingStatus.UP_TO_DATE)).toBe(807);
  });

  it("borne une progression manuelle au nombre de chapitres", () => {
    expect(resolveReadingChapter(900, 807, ReadingStatus.READING)).toBe(807);
    expect(resolveReadingChapter(-5, 807, ReadingStatus.READING)).toBe(0);
  });

  it("passe automatiquement à jour au dernier chapitre", () => {
    expect(resolveReadingStatus(858, 858, ReadingStatus.READING)).toBe(ReadingStatus.UP_TO_DATE);
  });

  it("termine automatiquement une œuvre publiée comme terminée", () => {
    expect(resolveReadingStatus(807, 807, ReadingStatus.READING, true)).toBe(ReadingStatus.COMPLETED);
  });

  it("conserve un statut terminal demandé", () => {
    expect(resolveReadingStatus(100, 858, ReadingStatus.PAUSED)).toBe(ReadingStatus.PAUSED);
    expect(resolveReadingStatus(100, 858, ReadingStatus.DROPPED)).toBe(ReadingStatus.DROPPED);
  });
});

describe("règles de notification", () => {
  it("calcule uniquement les chapitres non lus", () => {
    expect(newChapterDelta(853, 858)).toBe(5);
  });

  it("ne produit jamais de compteur négatif", () => {
    expect(newChapterDelta(858, 853)).toBe(0);
  });
});
