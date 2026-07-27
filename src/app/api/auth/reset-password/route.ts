import argon2 from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import { hashToken } from "@/lib/tokens";
import { passwordSchema } from "@/lib/validation/account";

const schema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

export async function POST(request: Request) {
  if (!rateLimit(requestKey(request, "reset"), 5, 15 * 60_000)) {
    return Response.json({ error: "Trop de tentatives." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Demande invalide." }, { status: 400 });
  }

  const reset = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return Response.json({ error: "Ce lien est invalide ou expiré." }, { status: 400 });
  }
  const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id });
  await db.$transaction([
    db.user.update({ where: { email: reset.email }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    db.session.deleteMany({ where: { user: { email: reset.email } } }),
  ]);
  return Response.json({ ok: true });
}
