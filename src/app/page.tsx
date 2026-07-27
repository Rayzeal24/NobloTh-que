import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bell, BookCheck, BookOpen, Clock3,
  Compass, Heart, Library, Search, TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const showcaseNovels = [
  {
    title: "Shadow Slave",
    detail: "Chapitre 1 934 sur 2 480",
    progress: 78,
    cover: "/shadow-slave.png",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    title: "Lord of the Mysteries",
    detail: "Lecture terminée",
    progress: 100,
    cover: "/lord-of-mysteries.png",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    title: "Mme et Monsieur Smith",
    detail: "12 nouveaux chapitres",
    progress: 64,
    cover: "/mrs-and-mr-smith.png",
    accent: "from-orange-400 to-rose-500",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden">
      <StoryMapBackdrop />

      <header className="relative z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <BrandLogo className="size-10 drop-shadow-[0_8px_16px_rgba(120,87,245,.3)]" priority />
            <span>Noblo<span className="text-primary">Thèque</span></span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <a href="#fonctionnalites" className="transition hover:text-foreground">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="transition hover:text-foreground">Comment ça marche</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/connexion" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground sm:block">Connexion</Link>
            <Link href="/inscription" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:brightness-110">Créer un compte</Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:pb-32 lg:pt-28">
        <div className="relative z-10 text-center lg:text-left">
          <h1 className="text-[3.15rem] font-black leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[4.5rem] xl:text-[5rem]">
            Ne perdez plus<br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">jamais le fil.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8 lg:mx-0">
            Votre bibliothèque de web novels, pensée pour retrouver votre progression et repérer immédiatement les nouvelles sorties.
          </p>
          <div className="mt-9 flex items-center justify-center lg:justify-start">
            <Link href="/inscription" className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 sm:w-auto">
              Créer ma bibliothèque <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
          <div className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" />
          <div className="landing-float absolute -left-3 top-20 z-20 hidden items-center gap-2 rounded-2xl border bg-surface/90 p-3 shadow-xl backdrop-blur sm:flex lg:-left-10">
            <span className="grid size-9 place-items-center rounded-xl bg-success/15 text-success"><TrendingUp size={17} /></span>
            <div><p className="text-[10px] text-muted">Cette semaine</p><p className="text-xs font-bold">+47 chapitres lus</p></div>
          </div>
          <div className="landing-float-delayed absolute -right-3 bottom-16 z-20 flex items-center gap-2 rounded-2xl border bg-surface/90 p-3 shadow-xl backdrop-blur lg:-right-8">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary"><Bell size={17} /></span>
            <div><p className="text-[10px] text-muted">Nouvelle sortie</p><p className="text-xs font-bold">5 chapitres disponibles</p></div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/85 p-3 shadow-[0_40px_100px_-30px_rgba(120,87,245,.38)] backdrop-blur-xl sm:p-5">
            <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="mb-5 flex items-center justify-between px-1 pt-1">
              <div>
                <p className="text-[11px] font-medium text-muted">Bonsoir, Alex</p>
                <p className="mt-0.5 text-lg font-extrabold">Reprendre la lecture</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative grid size-10 place-items-center rounded-xl bg-surface-2 text-muted"><Search size={17} /></span>
                <span className="relative grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Bell size={17} /><i className="absolute right-2 top-2 size-1.5 rounded-full bg-fuchsia-400" /></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                [Library, "12", "Romans"],
                [BookCheck, "3", "Terminés"],
                [Clock3, "1 247", "Chapitres"],
              ].map(([Icon, value, label]) => {
                const StatIcon = Icon as typeof Library;
                return (
                  <div key={label as string} className="rounded-2xl bg-surface-2/80 p-3">
                    <StatIcon size={14} className="mb-3 text-primary" />
                    <p className="text-lg font-black">{value as string}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted">{label as string}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2.5">
              {showcaseNovels.map((novel) => (
                <div key={novel.title} className="group flex items-center gap-3 rounded-2xl border border-transparent bg-surface-2/75 p-2.5 transition hover:border-primary/20 hover:bg-surface-2">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl shadow-md">
                    <Image src={novel.cover} alt="" fill sizes="48px" className="object-cover transition duration-300 group-hover:scale-105" />
                    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${novel.accent}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold sm:text-sm">{novel.title}</p>
                      <span className="text-[10px] font-black text-primary">{novel.progress}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted sm:text-[11px]">{novel.detail}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                      <div className={`h-full rounded-full bg-gradient-to-r ${novel.accent}`} style={{ width: `${novel.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading eyebrow="Tout ce qu’il vous faut" title="La lecture, enfin bien organisée." text="Une expérience épurée qui garde l’essentiel à portée de main, sur mobile comme sur ordinateur." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Bell} title="Alertes intelligentes" text="Soyez prévenu seulement lorsqu’un nouveau chapitre est réellement disponible." color="bg-fuchsia-500/10 text-fuchsia-400" />
          <FeatureCard icon={BookOpen} title="Progression précise" text="Retrouvez instantanément le dernier chapitre lu, même plusieurs mois plus tard." color="bg-sky-500/10 text-sky-400" />
          <FeatureCard icon={Heart} title="Favoris & notes" text="Conservez vos coups de cœur et évaluez chaque œuvre selon vos envies." color="bg-rose-500/10 text-rose-400" />
          <FeatureCard icon={Compass} title="Recherche rapide" text="Filtrez par pays, genre, statut ou nombre de chapitres en quelques secondes." color="bg-emerald-500/10 text-emerald-400" />
        </div>
      </section>

      <section id="comment-ca-marche" className="border-y bg-surface/60">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <SectionHeading eyebrow="Simple dès le premier chapitre" title="Trois étapes. Zéro distraction." text="NobloThèque vous accompagne sans jamais s’interposer entre vous et vos histoires." />
          <div className="relative mt-14 grid gap-5 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
            {[
              [Search, "01", "Trouvez votre roman", "Parcourez le catalogue ou recherchez précisément une œuvre."],
              [BookOpen, "02", "Notez votre progression", "Indiquez votre dernier chapitre et votre statut de lecture."],
              [Bell, "03", "Restez à jour", "Un badge vous indique automatiquement combien de chapitres vous attendent."],
            ].map(([Icon, step, title, text]) => {
              const StepIcon = Icon as typeof Search;
              return (
                <article key={step as string} className="relative rounded-[1.75rem] border bg-background p-6 text-center">
                  <span className="relative z-10 mx-auto grid size-16 place-items-center rounded-2xl border bg-surface text-primary shadow-lg"><StepIcon size={23} /></span>
                  <span className="mt-5 block text-[10px] font-black tracking-[.25em] text-primary">ÉTAPE {step as string}</span>
                  <h3 className="mt-2 text-lg font-extrabold">{title as string}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{text as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-black uppercase tracking-[.22em] text-primary">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black tracking-[-.035em] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-sm leading-7 text-muted sm:text-base">{text}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, color }: { icon: typeof Bell; title: string; text: string; color: string }) {
  return (
    <article className="group rounded-[1.75rem] border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <span className={`grid size-11 place-items-center rounded-2xl ${color}`}><Icon size={20} /></span>
      <h3 className="mt-7 font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </article>
  );
}

function StoryMapBackdrop() {
  const manuscriptLines = [
    "CHAPTER 853 · THE FORGOTTEN COAST · SEQUENCE IX · NORTH DISTRICT · ARCHIVE 07 · WAYPOINT UNKNOWN",
    "影の奴隷 · 第千九百三十四章 · 忘れられた物語 · 読者記録 · 東の境界線 · 座標 48.8566",
    "독자의 기록 · 마지막 장 · 오래된 왕국의 지도 · 북쪽 항로 · 봉인된 문서 · 좌표 미상",
    "卷之一千四百三十二 · 迷雾之城 · 旅人手记 · 古老航线 · 禁止通行 · 坐标 2.3522",
    "THE LAST READER REMEMBERS · FILE 001247 · ROUTE B-12 · STATUS UNFINISHED · CONTINUE EAST",
    "CHRONIQUE DES MONDES OUBLIÉS · FEUILLET 64 · PASSAGE DU NORD · COPIE INCOMPLÈTE",
    "ARC VII · DREAM REALM · OBSERVATION LOG · GATE THREE · MOONLESS NIGHT · ENTRY RESTRICTED",
    "페이지 오백오십일 · 멸망한 세계의 생존법 · 열람 기록 · 서울 외곽 · 다음 이야기",
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-18 -z-20 h-[850px] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,color-mix(in_srgb,var(--primary)_24%,transparent),transparent_62%)]" />
      <div className="landing-float absolute -left-24 top-24 size-72 rounded-full bg-violet-500/12 blur-[90px]" />
      <div className="landing-float-delayed absolute -right-20 top-52 size-80 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      <div className="absolute left-1/2 top-10 h-[650px] w-[1200px] max-w-[140vw] -translate-x-1/2 -rotate-[6deg] overflow-hidden rounded-[3.5rem] border border-primary/15 bg-primary/[.025] shadow-[0_0_140px_rgba(120,87,245,.14)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--primary)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_10%,transparent)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <svg className="absolute inset-0 h-full w-full text-primary opacity-[.17]" viewBox="0 0 1200 650" fill="none">
          <path d="M-40 155C95 77 176 237 312 158S516 28 650 134s239 92 330-2 190-52 268 14" stroke="currentColor" />
          <path d="M-30 179C93 103 190 263 324 183S523 53 653 159s241 89 333-4 184-50 262 17" stroke="currentColor" />
          <path d="M-18 204C104 130 203 289 337 208S531 78 658 184s242 86 334-6 178-47 256 20" stroke="currentColor" />
          <path d="M75 520c89-151 218-17 326-130s219-157 318-55 201 103 297-12 179-27 235 36" stroke="currentColor" />
          <path d="M102 541c84-138 207-9 313-119s210-146 308-45 197 98 291-13 174-21 229 40" stroke="currentColor" />
          <path d="M170 24c48 82-36 128 22 189s143 62 118 148-1 172 104 207 78 111 31 148" stroke="currentColor" />
          <circle cx="210" cy="178" r="5" fill="currentColor" />
          <circle cx="788" cy="338" r="5" fill="currentColor" />
          <circle cx="1014" cy="136" r="5" fill="currentColor" />
          <path d="M210 178 788 338 1014 136" stroke="currentColor" strokeDasharray="5 9" />
        </svg>
        <div className="absolute -left-20 top-2 flex w-[1350px] -rotate-[7deg] flex-col gap-8 font-mono text-[10px] font-semibold uppercase tracking-[.34em] text-primary opacity-[.16] sm:text-[11px]">
          {manuscriptLines.map((line, index) => (
            <p key={line} className="whitespace-nowrap" style={{ transform: `translateX(${index % 2 ? 80 : -35}px)` }}>{line} · {line}</p>
          ))}
        </div>
        <div className="absolute left-[17%] top-[23%] size-5 rounded-full border border-primary/25 before:absolute before:left-1/2 before:top-1/2 before:size-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-primary/50" />
        <div className="absolute bottom-[21%] right-[24%] size-8 rounded-full border border-primary/20 before:absolute before:inset-2 before:rounded-full before:border before:border-primary/20" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />
    </div>
  );
}
