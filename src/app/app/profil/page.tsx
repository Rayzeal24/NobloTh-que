import { auth } from "@/auth";
import {
  Ban, BookCheck, BookOpen, CalendarDays,
  CirclePause, Library, Mail, ShieldCheck, Sparkles, Trophy,
} from "lucide-react";
import { ProfileSettings } from "@/components/profile-settings";
import { db } from "@/lib/db";
import { formatNumber } from "@/lib/utils";

export default async function ProfilePage() {
  const session = (await auth())!;
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { library: { include: { novel: { include: { genres: true } } } } },
  });
  const entries = user.library;
  const chapters = entries.reduce((total, entry) => total + entry.lastReadChapter, 0);
  const level = Math.floor(chapters / 100) + 1;
  const levelProgress = chapters % 100;
  const rank = readerRank(chapters);
  const favoriteGenres = topGenres(entries.flatMap((entry) => entry.novel.genres.map((genre) => genre.name)));
  const stats = [
    [Library, entries.length, "Romans suivis", "bg-primary-soft text-primary"],
    [BookOpen, chapters, "Chapitres lus", "bg-sky-500/10 text-sky-400"],
    [BookCheck, entries.filter((entry) => entry.readingStatus === "COMPLETED").length, "Terminés", "bg-success/10 text-success"],
    [CirclePause, entries.filter((entry) => entry.readingStatus === "PAUSED").length, "En pause", "bg-warning/10 text-warning"],
    [Ban, entries.filter((entry) => entry.readingStatus === "DROPPED").length, "Abandonnés", "bg-red-500/10 text-red-400"],
  ] as const;

  return <div className="mx-auto max-w-6xl">
    <header className="mb-7">
      <p className="text-sm font-semibold text-primary">Registre personnel</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Fiche de lecteur</h1>
    </header>

    <section className="relative overflow-hidden rounded-[2rem] border bg-surface p-5 sm:p-8">
      <div className="absolute -right-28 -top-32 size-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-fuchsia-500/8 blur-3xl" />
      <div className="relative grid gap-7 md:grid-cols-[auto_1fr_280px] md:items-center">
        <div className="relative mx-auto md:mx-0">
          <div className="grid size-24 place-items-center rounded-[1.75rem] border border-primary/30 bg-gradient-to-br from-primary-soft to-surface-2 text-4xl font-black text-primary shadow-xl shadow-primary/10 sm:size-28">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <span className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-xl border-4 border-surface bg-primary text-xs font-black text-white">{level}</span>
        </div>

        <div className="min-w-0 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <h2 className="truncate text-2xl font-black sm:text-3xl">{user.name ?? "Lecteur"}</h2>
            {user.emailVerified && <ShieldCheck size={20} className="text-success" aria-label="Compte vérifié" />}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary">{rank}</span>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted">{user.role === "ADMIN" ? "Administrateur" : "Membre"}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:justify-center sm:gap-5 md:justify-start">
            <span className="flex items-center justify-center gap-1.5"><Mail size={13} />{user.email}</span>
            <span className="flex items-center justify-center gap-1.5"><CalendarDays size={13} />Depuis {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(user.createdAt)}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between"><span className="text-xs font-bold">Niveau {level}</span><span className="text-[11px] text-muted">{levelProgress} / 100 XP</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-400" style={{ width: `${levelProgress}%` }} /></div>
          <p className="mt-3 text-[11px] leading-5 text-muted">Chaque chapitre lu rapporte un point d’expérience.</p>
        </div>
      </div>
    </section>

    <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map(([Icon, value, label, style]) => (
        <div key={label} className="rounded-2xl border bg-surface p-4">
          <span className={`mb-4 grid size-9 place-items-center rounded-xl ${style}`}><Icon size={17} /></span>
          <strong className="text-xl font-black">{formatNumber(value)}</strong>
          <p className="mt-1 text-[11px] text-muted">{label}</p>
        </div>
      ))}
    </section>

    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-5">
        <div className="rounded-2xl border bg-surface p-5">
          <div className="flex items-center gap-2"><Trophy size={18} className="text-warning" /><h3 className="font-bold">Spécialités</h3></div>
          <p className="mt-1 text-xs text-muted">Vos genres les plus suivis</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {favoriteGenres.length ? favoriteGenres.map((genre) => <span key={genre} className="rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold">{genre}</span>) : <span className="text-sm text-muted">Ajoutez des romans pour révéler vos affinités.</span>}
          </div>
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-primary-soft to-surface p-5">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-primary" /><h3 className="font-bold">Titre actuel</h3></div>
          <p className="mt-4 text-2xl font-black text-primary">{rank}</p>
          <p className="mt-2 text-sm leading-6 text-muted">Continuez à lire pour faire évoluer votre fiche et débloquer le prochain rang.</p>
        </div>
      </section>
      <ProfileSettings name={user.name ?? ""} email={user.email} />
    </div>
  </div>;
}

function readerRank(chapters: number) {
  if (chapters >= 5000) return "Oracle des récits";
  if (chapters >= 2000) return "Maître archiviste";
  if (chapters >= 1000) return "Chroniqueur";
  if (chapters >= 500) return "Explorateur confirmé";
  if (chapters >= 100) return "Aventurier des pages";
  return "Lecteur novice";
}

function topGenres(genres: string[]) {
  const counts = new Map<string, number>();
  for (const genre of genres) counts.set(genre, (counts.get(genre) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([genre]) => genre);
}
