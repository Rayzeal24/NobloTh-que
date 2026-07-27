import type { Prisma, PublicationStatus } from "@prisma/client";
import { BookOpen, Compass, Sparkles } from "lucide-react";
import { CatalogFilters } from "@/components/novels/catalog-filters";
import { NovelCard } from "@/components/novels/novel-card";
import { db } from "@/lib/db";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const where: Prisma.NovelWhereInput = {
    ...(params.q && { OR: [{ title: { contains: params.q, mode: "insensitive" } }, { author: { name: { contains: params.q, mode: "insensitive" } } }] }),
    ...(params.country && { country: params.country }),
    ...(params.genre && { genres: { some: { slug: params.genre } } }),
    ...(params.status && { publicationStatus: params.status as PublicationStatus }),
  };
  const [novels, genres, countryRows] = await Promise.all([
    db.novel.findMany({ where, include: { author: true, genres: true }, orderBy: { title: "asc" } }),
    db.genre.findMany({ orderBy: { name: "asc" } }),
    db.novel.findMany({ distinct: ["country"], select: { country: true }, orderBy: { country: "asc" } }),
  ]);
  return <div className="mx-auto max-w-7xl">
    <section className="relative overflow-hidden rounded-[2rem] border bg-surface p-5 shadow-2xl shadow-black/10 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 size-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:grid"><Compass size={22} /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-primary">Explorer le catalogue</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Trouvez votre prochaine histoire</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Parcourez les univers disponibles et affinez instantanément votre recherche.</p>
          </div>
        </div>
        <CatalogFilters
          initialFilters={params}
          genres={genres.map((genre) => [genre.slug, genre.name])}
          countries={countryRows.map(({ country }) => [country, country])}
        />
      </div>
    </section>

    <div className="mb-5 mt-9 flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold text-primary"><Sparkles size={14} />Sélection NobloThèque</p>
        <h2 className="mt-1 text-xl font-extrabold">{novels.length} œuvre{novels.length !== 1 && "s"} disponible{novels.length !== 1 && "s"}</h2>
      </div>
    </div>

    {novels.length
      ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">{novels.map((novel) => <NovelCard key={novel.id} novel={novel} />)}</div>
      : <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed bg-surface/50 p-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpen size={20} /></span>
        <h2 className="mt-4 font-extrabold">Aucune histoire trouvée</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Modifiez simplement vos filtres pour découvrir d’autres œuvres.</p>
      </div>}
  </div>;
}
