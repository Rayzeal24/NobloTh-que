import Image from "next/image";
import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

type NovelCardProps = {
  novel: {
    title: string; slug: string; coverUrl: string; chapterCount: number;
    author: { name: string }; genres?: { name: string }[];
  };
  progress?: number;
  unread?: number;
  favorite?: boolean;
  compact?: boolean;
};

export function NovelCard({ novel, progress, unread = 0, favorite, compact }: NovelCardProps) {
  const percent = progress === undefined || !novel.chapterCount ? undefined : Math.min(100, Math.round(progress / novel.chapterCount * 100));
  return (
    <Link href={`/app/romans/${novel.slug}`} className={cn("group block min-w-0", compact && "flex gap-3")}>
      <div className={cn("relative overflow-hidden rounded-2xl bg-surface-2 shadow-sm", compact ? "h-28 w-20 shrink-0" : "aspect-[.68]")}>
        <Image src={novel.coverUrl} alt={`Couverture de ${novel.title}`} fill sizes={compact ? "80px" : "(max-width: 640px) 42vw, 220px"} className="object-cover transition duration-300 group-hover:scale-[1.03]" />
        {unread > 0 && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">+{unread}</span>}
        {favorite && <Heart className="absolute left-2 top-2 fill-red-500 text-red-500 drop-shadow" size={17} />}
        {percent !== undefined && <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>}
      </div>
      <div className={cn("min-w-0", compact ? "py-1" : "pt-3")}>
        <h3 className="truncate text-sm font-bold group-hover:text-primary">{novel.title}</h3>
        <p className="mt-1 truncate text-xs text-muted">{novel.author.name}</p>
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted"><BookOpen size={12} /> {formatNumber(novel.chapterCount)} chap.</p>
      </div>
    </Link>
  );
}
