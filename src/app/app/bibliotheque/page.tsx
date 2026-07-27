import Link from "next/link";
import type { ReadingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { NovelCard } from "@/components/novels/novel-card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

const tabs = [
  ["", "Tout"], ["READING", "En cours"], ["UP_TO_DATE", "À jour"], ["PAUSED", "En pause"],
  ["COMPLETED", "Terminés"], ["DROPPED", "Abandonnés"],
];

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const status = tabs.some(([key]) => key === params.status) ? params.status : "";
  const entries = await db.libraryEntry.findMany({
    where: { userId: session!.user.id, ...(status && { readingStatus: status as ReadingStatus }) },
    include: { novel: { include: { author: true } } },
    orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
  });
  return <>
    <header><p className="text-sm text-primary">Vos lectures</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Ma bibliothèque</h1></header>
    <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {tabs.map(([key, label]) => <Link key={key} href={key ? `/app/bibliotheque?status=${key}` : "/app/bibliotheque"} className={cn("shrink-0 rounded-full border bg-surface px-4 py-2 text-xs font-semibold text-muted", status === key && "border-primary bg-primary text-white")}>{label}</Link>)}
    </nav>
    {entries.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">{entries.map((entry) => <NovelCard key={entry.id} novel={entry.novel} progress={entry.currentChapter} unread={entry.unreadChapters} favorite={entry.favorite} />)}</div> : <div className="mt-8 rounded-2xl border border-dashed px-5 py-16 text-center"><p className="font-bold">Cette étagère est vide</p><p className="mt-2 text-sm text-muted">Explorez le catalogue pour ajouter votre première œuvre.</p><Link href="/app/recherche" className="mt-5 inline-block rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Explorer</Link></div>}
  </>;
}
