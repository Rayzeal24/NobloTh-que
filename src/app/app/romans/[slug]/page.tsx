import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Globe2, Languages, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { ProgressPanel } from "@/components/novels/progress-panel";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/utils";

const publicationLabels = { ONGOING: "En cours", COMPLETED: "Terminé", HIATUS: "Hiatus" };

export default async function NovelPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, auth()]);
  const novel = await db.novel.findUnique({ where: { slug }, include: { author: true, genres: true } });
  if (!novel || !session?.user) notFound();
  const [entry] = await Promise.all([
    db.libraryEntry.findUnique({ where: { userId_novelId: { userId: session.user.id, novelId: novel.id } } }),
    db.recentlyViewed.upsert({
      where: { userId_novelId: { userId: session.user.id, novelId: novel.id } },
      create: { userId: session.user.id, novelId: novel.id },
      update: { viewedAt: new Date() },
    }),
  ]);
  return <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-5xl items-center py-6">
    <div className="w-full">
    <div className="grid gap-7 md:grid-cols-[240px_1fr]">
      <div className="relative mx-auto aspect-[.68] w-full max-w-60 overflow-hidden rounded-3xl bg-surface-2 shadow-2xl"><Image src={novel.coverUrl} alt={`Couverture de ${novel.title}`} fill priority sizes="240px" className="object-cover" /></div>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-2">{novel.genres.map((genre) => <span key={genre.id} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{genre.name}</span>)}</div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{novel.title}</h1>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info icon={UserRound} label="Auteur" value={novel.author.name} />
          <Info icon={Globe2} label="Origine" value={novel.country} />
          <Info icon={Languages} label="Langue" value={novel.language} />
          <Info icon={BookOpen} label="Publication" value={publicationLabels[novel.publicationStatus]} />
        </div>
        <section className="mt-7"><h2 className="font-bold">Résumé</h2><p className="mt-3 leading-7 text-muted">{novel.synopsis}</p></section>
      </div>
    </div>
    <section className="mt-8 grid gap-5 md:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border bg-surface p-5"><p className="text-sm text-muted">Chapitres connus</p><p className="mt-1 text-3xl font-extrabold">{formatNumber(novel.chapterCount)}</p><p className="mt-3 text-sm text-muted">Statut éditorial : <strong className="text-foreground">{publicationLabels[novel.publicationStatus]}</strong></p></div>
      <div className="rounded-2xl border bg-surface p-5"><ProgressPanel novelId={novel.id} title={novel.title} coverUrl={novel.coverUrl} chapterCount={novel.chapterCount} initial={entry} /></div>
    </section>
    </div>
  </div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="rounded-xl bg-surface-2 p-3"><Icon size={16} className="mb-2 text-primary" /><p className="text-[10px] uppercase tracking-wide text-muted">{label}</p><p className="mt-1 truncate text-xs font-semibold">{value}</p></div>;
}
