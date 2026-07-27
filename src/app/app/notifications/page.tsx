import { auth } from "@/auth";
import { NotificationsList } from "@/components/notifications-list";
import { db } from "@/lib/db";

export default async function NotificationsPage() {
  const session = (await auth())!;
  const items = await db.notification.findMany({
    where: { userId: session.user.id },
    include: { novel: { select: { slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <div className="mx-auto max-w-3xl">
    <header className="mb-7"><p className="text-sm text-primary">Nouvelles sorties</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Notifications</h1></header>
    {items.length ? <NotificationsList items={items} /> : <div className="rounded-2xl border border-dashed py-16 text-center"><p className="font-bold">Tout est calme</p><p className="mt-2 text-sm text-muted">Les nouveaux chapitres apparaîtront ici.</p></div>}
  </div>;
}
