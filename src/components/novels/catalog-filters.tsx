"use client";

import { BookMarked, Globe2, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Filters = {
  q: string;
  genre: string;
  country: string;
  status: string;
};

type CatalogFiltersProps = {
  initialFilters: Partial<Filters>;
  genres: Array<[string, string]>;
  countries: Array<[string, string]>;
};

export function CatalogFilters({ initialFilters, genres, countries }: CatalogFiltersProps) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filters, setFilters] = useState<Filters>({
    q: initialFilters.q ?? "",
    genre: initialFilters.genre ?? "",
    country: initialFilters.country ?? "",
    status: initialFilters.status ?? "",
  });

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function apply(next: Filters, delay = 0) {
    if (timer.current) clearTimeout(timer.current);
    const navigate = () => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    };
    if (delay) timer.current = setTimeout(navigate, delay);
    else navigate();
  }

  function change<K extends keyof Filters>(key: K, value: Filters[K], delay = 0) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    apply(next, delay);
  }

  return (
    <form
      className="relative mt-7"
      onSubmit={(event) => {
        event.preventDefault();
        apply(filters);
      }}
    >
      <div className="relative rounded-2xl border border-white/10 bg-background/70 shadow-lg shadow-black/10 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={19} />
        <input
          value={filters.q}
          onChange={(event) => change("q", event.target.value, 350)}
          placeholder="Rechercher un titre ou un auteur…"
          aria-label="Rechercher par titre ou auteur"
          className="h-14 w-full rounded-2xl bg-transparent pl-12 pr-4 text-sm outline-none placeholder:text-muted/70"
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <FilterSelect icon={Sparkles} caption="Genre" value={filters.genre} label="Tous les genres" options={genres} onChange={(value) => change("genre", value)} />
        <FilterSelect icon={Globe2} caption="Origine" value={filters.country} label="Tous les pays" options={countries} onChange={(value) => change("country", value)} />
        <FilterSelect
          icon={BookMarked}
          caption="Publication"
          value={filters.status}
          label="Tous les statuts"
          options={[["ONGOING", "En cours"], ["COMPLETED", "Terminé"], ["HIATUS", "Hiatus"]]}
          onChange={(value) => change("status", value)}
        />
      </div>
    </form>
  );
}

function FilterSelect({ icon: Icon, caption, value, label, options, onChange }: {
  icon: typeof Sparkles;
  caption: string;
  value: string;
  label: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group relative flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-background/60 px-4 py-3 transition hover:border-primary/30">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={16} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black uppercase tracking-[.16em] text-muted">{caption}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-0.5 block w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold outline-none">
          <option value="">{label}</option>
          {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
        </select>
      </span>
    </label>
  );
}
