"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";

type Novel = { id: string; title: string; chapterCount: number; publicationStatus: string; author: { name: string }; _count: { libraryEntries: number } };

export function NovelAdmin({ novels }: { novels: Novel[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/novels", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"), author: form.get("author"), coverUrl: form.get("coverUrl"),
        synopsis: form.get("synopsis"), country: form.get("country"), language: form.get("language"),
        publicationStatus: form.get("publicationStatus"), chapterCount: Number(form.get("chapterCount")),
        genres: String(form.get("genres")).split(",").map((g) => g.trim()).filter(Boolean),
      }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error); else { setOpen(false); router.refresh(); }
    setLoading(false);
  }
  async function updateCount(id: string, count: number) {
    await fetch(`/api/admin/novels/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterCount: count }) });
    router.refresh();
  }
  return <>
    <div className="mb-6 flex items-center justify-between"><div><p className="text-sm text-primary">Catalogue manuel</p><h1 className="text-2xl font-extrabold">Œuvres</h1></div><Button onClick={() => setOpen((v) => !v)}><Plus size={17} />Nouvelle œuvre</Button></div>
    {open && <form onSubmit={create} className="mb-7 grid gap-3 rounded-2xl border bg-surface p-5 sm:grid-cols-2">
      <Input name="title" placeholder="Titre" required /><Input name="author" placeholder="Auteur" required />
      <Input name="coverUrl" type="url" placeholder="URL de la couverture" required /><Input name="genres" placeholder="Genres séparés par des virgules" required />
      <Input name="country" placeholder="Pays d’origine" required /><Input name="language" placeholder="Langue" required />
      <Input name="chapterCount" type="number" min="0" placeholder="Nombre de chapitres" required />
      <select name="publicationStatus" className="h-12 rounded-xl border bg-background px-4 text-sm"><option value="ONGOING">En cours</option><option value="COMPLETED">Terminé</option><option value="HIATUS">Hiatus</option></select>
      <textarea name="synopsis" placeholder="Résumé de l’œuvre" minLength={20} required className="min-h-28 rounded-xl border bg-background p-4 text-sm outline-none focus:border-primary sm:col-span-2" />
      {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2"><Button disabled={loading}>{loading && <LoaderCircle size={17} className="animate-spin" />}Créer l’œuvre</Button></div>
    </form>}
    <div className="overflow-hidden rounded-2xl border bg-surface">
      <div className="hidden grid-cols-[1fr_180px_160px_120px] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase text-muted md:grid"><span>Œuvre</span><span>Statut</span><span>Chapitres</span><span>Lecteurs</span></div>
      {novels.map((novel) => <div key={novel.id} className="grid gap-3 border-b p-4 last:border-0 md:grid-cols-[1fr_180px_160px_120px] md:items-center md:px-5">
        <div><p className="font-bold">{novel.title}</p><p className="text-xs text-muted">{novel.author.name}</p></div>
        <span className="w-fit rounded-full bg-surface-2 px-3 py-1 text-xs">{novel.publicationStatus === "ONGOING" ? "En cours" : novel.publicationStatus === "COMPLETED" ? "Terminé" : "Hiatus"}</span>
        <CountEditor count={novel.chapterCount} onSave={(count) => updateCount(novel.id, count)} />
        <span className="text-sm text-muted">{formatNumber(novel._count.libraryEntries)} suivi{novel._count.libraryEntries !== 1 && "s"}</span>
      </div>)}
    </div>
  </>;
}

function CountEditor({ count, onSave }: { count: number; onSave: (count: number) => void }) {
  const [value, setValue] = useState(count);
  return <div className="flex items-center gap-1"><input className="h-9 w-24 rounded-lg border bg-background px-2 text-sm" type="number" min="0" value={value} onChange={(e) => setValue(Number(e.target.value))} /><button aria-label="Mettre à jour" onClick={() => onSave(value)} className="grid size-9 place-items-center rounded-lg text-primary hover:bg-primary-soft"><RefreshCw size={15} /></button></div>;
}
