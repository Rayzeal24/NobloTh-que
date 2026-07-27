import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/app");
  return <div className="min-h-dvh">
    <header className="border-b bg-surface"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/admin" className="flex items-center gap-2 font-bold"><BrandLogo className="size-9" priority />Administration</Link><Link href="/app" className="flex items-center gap-2 text-sm text-muted hover:text-foreground"><ArrowLeft size={16} />Retour à l’application</Link></div></header>
    <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
  </div>;
}
