import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createUsernameKey, usernameSchema } from "@/lib/validation/account";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = usernameSchema.safeParse(body?.name);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Nom invalide." }, { status: 400 });
  }
  const usernameKey = createUsernameKey(parsed.data);
  const existing = await db.user.findFirst({
    where: { usernameKey, id: { not: session.user.id } },
    select: { id: true },
  });
  if (existing) return Response.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
  try {
    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data, usernameKey },
      select: { id: true, name: true, email: true },
    });
    return Response.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
    }
    throw error;
  }
}
