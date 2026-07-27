import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Library, Sparkles, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { NovelCard } from "@/components/novels/novel-card";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = (await auth())!;
  const userId = session.user.id;
  const [entries, recent, discoveries] = await Promise.all([
    db.libraryEntry.findMany({ where: { userId }, include: { novel: { include: { author: true } } }, orderBy: { updatedAt: "desc" } }),
    db.recentlyViewed.findMany({ where: { userId }, include: { novel: { include: { author: true } } }, orderBy: { viewedAt: "desc" }, take: 6 }),
    db.novel.findMany({ include: { author: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  const continueReading = entries.filter((e) => e.readingStatus === "READING" || e.readingStatus === "UP_TO_DATE").slice(0, 6);

  return <div className="mx-auto max-w-6xl">
    <section className="relative overflow-hidden rounded-[2rem] border bg-surface p-6 shadow-2xl shadow-black/10 sm:p-9">
      <div className="absolute -right-20 -top-32 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative z-10 max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[.22em] text-primary">Votre espace de lecture</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Bonsoir, {session.user.name?.split(" ")[0] ?? "lecteur"}.</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted sm:text-base">Retrouvez vos histoires, reprenez votre progression et découvrez votre prochaine lecture.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/app/recherche" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
            <Compass size={17} />Explorer le catalogue
          </Link>
          <Link href="/app/profil" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-background/50 px-5 text-sm font-bold transition hover:bg-surface-2">
            <UserRound size={17} />Ma fiche de lecteur
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 right-8 hidden h-48 w-64 md:block" aria-hidden="true">
        <div className="absolute bottom-[-22px] right-28 h-44 w-28 -rotate-12 rounded-t-2xl border border-primary/30 bg-gradient-to-br from-violet-500/50 to-primary-soft shadow-xl" />
        <div className="absolute bottom-[-16px] right-14 h-48 w-30 rotate-3 rounded-t-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/35 to-surface-2 shadow-2xl" />
        <div className="absolute bottom-[-24px] right-0 h-40 w-26 rotate-12 rounded-t-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/30 to-surface-2 shadow-xl" />
        <Sparkles className="absolute right-5 top-4 text-primary" size={24} />
      </div>
    </section>

    <Section title="Continuer la lecture" subtitle="Reprenez exactement là où vous vous êtes arrêté" href="/app/bibliotheque">
      {continueReading.length
        ? continueReading.map((entry) => <NovelCard key={entry.id} novel={entry.novel} progress={entry.currentChapter} unread={entry.unreadChapters} favorite={entry.favorite} />)
        : <EmptyState icon={BookOpen} title="Votre bibliothèque vous attend" text="Ajoutez une première œuvre pour commencer à suivre votre progression." href="/app/recherche" action="Trouver un roman" />}
    </Section>

    {recent.length > 0 && <Section title="Consultés récemment" subtitle="Vos dernières fiches ouvertes">
      {recent.map((item) => <NovelCard key={item.id} novel={item.novel} compact />)}
    </Section>}

    <Section title="À découvrir" subtitle="Les dernières œuvres ajoutées au catalogue" href="/app/recherche">
      {discoveries.length
        ? discoveries.map((novel) => <NovelCard key={novel.id} novel={novel} />)
        : <EmptyState icon={Library} title="Le catalogue se prépare" text="Les premières œuvres apparaîtront ici dès leur ajout." href="/app/recherche" action="Ouvrir le catalogue" />}
    </Section>
  </div>;
}

function Section({ title, subtitle, href, children }: { title: string; subtitle: string; href?: string; children: React.ReactNode }) {
  return <section className="mt-10">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div><h2 className="text-lg font-extrabold sm:text-xl">{title}</h2><p className="mt-1 text-xs text-muted">{subtitle}</p></div>
      {href && <Link href={href} className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">Tout voir <ArrowRight size={14} /></Link>}
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{children}</div>
  </section>;
}

function EmptyState({ icon: Icon, title, text, href, action }: { icon: typeof BookOpen; title: string; text: string; href: string; action: string }) {
  return <div className="col-span-full flex min-h-52 flex-col items-center justify-center rounded-[1.75rem] border border-dashed bg-surface/60 p-7 text-center">
    <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Icon size={21} /></span>
    <h3 className="mt-4 font-extrabold">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-muted">{text}</p>
    <Link href={href} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-4 text-xs font-bold transition hover:border-primary/40 hover:text-primary">{action}<ArrowRight size={14} /></Link>
  </div>;
}
