"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, LoaderCircle, Minus, PartyPopper, Plus, Sparkles, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Entry = {
  currentChapter: number;
  readingStatus: string;
  rating: number | null;
  favorite: boolean;
} | null;

const statusLabels: Record<string, string> = {
  READING: "En cours",
  UP_TO_DATE: "À jour",
  PAUSED: "En pause",
  COMPLETED: "Terminé",
  DROPPED: "Abandonné",
};

const fireworkBursts = [
  { left: "18%", top: "38%", delay: "0ms" },
  { left: "80%", top: "32%", delay: "180ms" },
  { left: "50%", top: "20%", delay: "350ms" },
  { left: "32%", top: "60%", delay: "520ms" },
  { left: "70%", top: "58%", delay: "700ms" },
];
const fireworkColors = ["#9b7cff", "#ff55c8", "#38f2bd", "#ffd84d", "#55b8ff", "#ff704d"];

export function ProgressPanel({
  novelId, title, coverUrl, chapterCount, initial,
}: {
  novelId: string;
  title: string;
  coverUrl: string;
  chapterCount: number;
  initial: Entry;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState(initial);
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState(initial?.currentChapter ?? 0);
  const [status, setStatus] = useState(initial?.readingStatus ?? "READING");
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [loading, setLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 2800);
    return () => window.clearTimeout(timer);
  }, [celebrate]);

  function showEditor() {
    setChapter(entry?.currentChapter ?? 0);
    setStatus(entry?.readingStatus ?? "READING");
    setRating(entry?.rating ?? 0);
    setFavorite(entry?.favorite ?? false);
    setOpen(true);
  }

  async function save() {
    setLoading(true);
    const response = await fetch(`/api/library/${novelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter, status, rating: rating || null, favorite }),
    });
    if (response.ok) {
      const data = await response.json();
      if (entry?.readingStatus !== "COMPLETED" && data.readingStatus === "COMPLETED") {
        setCelebrate(true);
      }
      setEntry(data);
      setChapter(data.currentChapter);
      setOpen(false);
    }
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    setLoading(true);
    const response = await fetch(`/api/library/${novelId}`, { method: "DELETE" });
    if (response.ok) {
      setEntry(null);
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  const currentPercent = entry && chapterCount ? Math.round(entry.currentChapter / chapterCount * 100) : 0;
  return <>
    {celebrate && <Fireworks />}
    {entry ? (
      <div>
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted">Votre lecture</p><p className="mt-1 font-bold">{statusLabels[entry.readingStatus]}</p></div><span className="rounded-xl bg-primary-soft px-3 py-2 text-xs font-black text-primary">{entry.currentChapter} / {chapterCount}</span></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-400" style={{ width: `${currentPercent}%` }} /></div>
        <Button className="mt-5 w-full" size="lg" onClick={showEditor}><BookOpen size={17} />Modifier ma lecture</Button>
      </div>
    ) : (
      <Button className="w-full" size="lg" onClick={showEditor}><Plus size={18} />Ajouter à ma bibliothèque</Button>
    )}

    {open && (
      <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="reading-editor-title" className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border bg-surface shadow-2xl shadow-black/50">
          <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl bg-background/80 text-muted transition hover:text-foreground" aria-label="Fermer"><X size={18} /></button>

          <div className="grid gap-6 p-5 sm:grid-cols-[120px_1fr] sm:p-7">
            <div className="relative mx-auto aspect-[.68] w-28 overflow-hidden rounded-2xl bg-surface-2 shadow-xl sm:mx-0 sm:w-full">
              <Image src={coverUrl} alt={`Couverture de ${title}`} fill sizes="120px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{entry ? "Modifier le suivi" : "Nouvelle lecture"}</p>
              <h2 id="reading-editor-title" className="mt-2 pr-10 text-xl font-black leading-tight sm:text-2xl">{title}</h2>
              <p className="mt-2 text-sm text-muted">{chapterCount} chapitres connus</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-semibold text-muted">Statut</span>
                  <select value={status} onChange={(event) => {
                    const nextStatus = event.target.value;
                    setStatus(nextStatus);
                    if (nextStatus === "COMPLETED" || nextStatus === "UP_TO_DATE") setChapter(chapterCount);
                  }} className="h-12 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary">
                    <option value="READING">En cours</option><option value="UP_TO_DATE">À jour</option><option value="PAUSED">En pause</option><option value="COMPLETED">Terminé</option><option value="DROPPED">Abandonné</option>
                  </select>
                </label>
                <div><span className="mb-2 block text-xs font-semibold text-muted">Progression</span>
                  <div className="flex h-12 items-center rounded-xl border bg-background">
                    <button type="button" onClick={() => setChapter((value) => Math.max(0, value - 1))} className="grid size-11 shrink-0 place-items-center text-muted hover:text-primary" aria-label="Chapitre précédent"><Minus size={16} /></button>
                    <input type="number" min={0} max={chapterCount} value={chapter} onChange={(event) => setChapter(Math.max(0, Math.min(chapterCount, Number(event.target.value))))} className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-bold outline-none" />
                    <button type="button" onClick={() => setChapter((value) => Math.min(chapterCount, value + 1))} className="grid size-11 shrink-0 place-items-center text-muted hover:text-primary" aria-label="Chapitre suivant"><Plus size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-background p-3"><span className="text-xs font-semibold text-muted">Votre note</span><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} étoiles`}><Star size={21} className={value <= rating ? "fill-warning text-warning" : "text-muted"} /></button>)}</div></div>
                <button type="button" onClick={() => setFavorite((value) => !value)} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition ${favorite ? "border-red-500/30 bg-red-500/10 text-red-400" : "bg-background text-muted hover:text-foreground"}`}><Heart size={18} className={favorite ? "fill-current" : ""} />{favorite ? "Dans les favoris" : "Ajouter aux favoris"}</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t bg-background/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            {entry ? <Button variant="danger" onClick={remove} disabled={loading}><Trash2 size={16} />Retirer de la bibliothèque</Button> : <span />}
            <div className="flex gap-2"><Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button><Button onClick={save} disabled={loading}>{loading && <LoaderCircle size={17} className="animate-spin" />}Enregistrer</Button></div>
          </div>
        </div>
      </div>
    )}
  </>;
}

function Fireworks() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden" role="status" aria-label="Roman terminé">
      <div className="celebration-glow absolute inset-0" />
      {Array.from({ length: 34 }, (_, index) => (
        <span
          key={`confetti-${index}`}
          className="celebration-confetti"
          style={{
            left: `${(index * 29) % 100}%`,
            "--confetti-color": fireworkColors[index % fireworkColors.length],
            "--confetti-rotation": `${(index * 47) % 360}deg`,
            animationDelay: `${(index % 11) * 70}ms`,
            animationDuration: `${1700 + index % 5 * 180}ms`,
          } as CSSProperties}
        />
      ))}
      {fireworkBursts.map((burst) => (
        <div key={`${burst.left}-${burst.top}`} className="absolute" style={{ left: burst.left, top: burst.top }}>
          {Array.from({ length: 22 }, (_, index) => (
            <span
              key={index}
              className="firework-particle"
              style={{
                "--angle": `${index * (360 / 22)}deg`,
                "--distance": `${95 + index % 5 * 15}px`,
                "--particle-color": fireworkColors[index % fireworkColors.length],
                animationDelay: burst.delay,
              } as CSSProperties}
            />
          ))}
        </div>
      ))}
      <div className="firework-message absolute left-1/2 top-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/25 bg-gradient-to-r from-violet-600 via-primary to-fuchsia-500 px-6 py-4 text-base font-black text-white shadow-[0_0_60px_rgba(155,124,255,.55)] backdrop-blur sm:px-8 sm:text-xl">
        <PartyPopper size={24} />
        Roman terminé&nbsp;!
        <Sparkles size={22} />
      </div>
    </div>
  );
}
