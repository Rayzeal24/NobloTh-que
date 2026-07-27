"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellRing, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

type Notice = { id: string; title: string; message: string; readAt: Date | null; createdAt: Date; novel: { slug: string } | null };

export function NotificationsList({ items }: { items: Notice[] }) {
  const router = useRouter();
  async function mark(all: boolean, id?: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all, id }) });
    router.refresh();
  }
  return <>
    {items.some((item) => !item.readAt) && <div className="mb-4 flex justify-end"><Button variant="ghost" size="sm" onClick={() => mark(true)}><CheckCheck size={16} />Tout marquer comme lu</Button></div>}
    <div className="space-y-3">
      {items.map((item) => {
        const content = <div className={`flex gap-4 rounded-2xl border p-4 transition ${item.readAt ? "bg-surface" : "border-primary/30 bg-primary-soft/50"}`} onClick={() => !item.readAt && mark(false, item.id)}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><BellRing size={18} /></span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{item.title}</p>{!item.readAt && <span className="size-2 rounded-full bg-primary" />}</div><p className="mt-1 text-sm text-muted">{item.message}</p><p className="mt-2 text-[11px] text-muted">{formatRelativeDate(item.createdAt)}</p></div>
        </div>;
        return item.novel ? <Link key={item.id} href={`/app/romans/${item.novel.slug}`}>{content}</Link> : <div key={item.id}>{content}</div>;
      })}
    </div>
  </>;
}
