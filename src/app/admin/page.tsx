import { NovelAdmin } from "@/components/admin/novel-admin";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const novels = await db.novel.findMany({
    include: { author: true, _count: { select: { libraryEntries: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return <NovelAdmin novels={novels} />;
}
