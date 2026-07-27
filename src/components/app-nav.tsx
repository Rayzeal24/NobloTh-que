"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, Compass, LayoutDashboard, Library, LogOut, User } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Accueil", icon: LayoutDashboard },
  { href: "/app/recherche", label: "Explorer", icon: Compass },
  { href: "/app/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/app/notifications", label: "Alertes", icon: Bell },
  { href: "/app/profil", label: "Profil", icon: User },
];

export function AppNav({ unread = 0, isAdmin = false }: { unread?: number; isAdmin?: boolean }) {
  const path = usePathname();
  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-surface p-4 lg:flex">
      <Link href="/app" className="flex items-center gap-2 px-2 py-3 text-lg font-bold">
        <BrandLogo className="size-9" priority />NobloThèque
      </Link>
      <nav className="mt-8 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? path === href : path.startsWith(href);
          return <Link key={href} href={href} className={cn("relative flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-foreground", active && "bg-primary-soft text-primary")}>
            <Icon size={19} />{label}{label === "Alertes" && unread > 0 && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">{unread}</span>}
          </Link>;
        })}
        {isAdmin && <Link href="/admin" className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-warning"><SparkleIcon />Administration</Link>}
      </nav>
      <div className="mt-auto space-y-1">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-surface-2"><LogOut size={18} />Déconnexion</button>
      </div>
    </aside>
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex items-start justify-around border-t bg-surface/95 px-1 pt-2 backdrop-blur lg:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} className={cn("relative flex min-w-14 flex-col items-center gap-1 px-1 py-1 text-[10px] font-semibold text-muted", active && "text-primary")}>
          <Icon size={21} strokeWidth={active ? 2.5 : 2} />{label === "Bibliothèque" ? "Biblio" : label}{label === "Alertes" && unread > 0 && <span className="absolute right-2 top-0 size-2 rounded-full bg-primary" />}
        </Link>;
      })}
    </nav>
  </>;
}

function SparkleIcon() { return <span className="grid size-[19px] place-items-center">✦</span>; }
