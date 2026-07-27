import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const unread = await db.notification.count({ where: { userId: session.user.id, readAt: null } });
  return (
    <div className="min-h-dvh lg:pl-64">
      <AppNav unread={unread} isAdmin={session.user.role === "ADMIN"} />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-9">{children}</main>
    </div>
  );
}
