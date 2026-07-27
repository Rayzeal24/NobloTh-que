import { z } from "zod";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import { createToken } from "@/lib/tokens";

export async function POST(request: Request) {
  if (!rateLimit(requestKey(request, "forgot"), 3, 15 * 60_000)) {
    return Response.json({ ok: true });
  }
  const parsed = z.object({ email: z.string().email().transform((v) => v.toLowerCase()) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: true });

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user?.passwordHash) {
    await db.passwordResetToken.deleteMany({ where: { email: user.email, usedAt: null } });
    const { token, hash } = createToken();
    await db.passwordResetToken.create({
      data: { email: user.email, tokenHash: hash, expiresAt: new Date(Date.now() + 60 * 60_000) },
    });
    const baseUrl = process.env.AUTH_URL ?? new URL(request.url).origin;
    await sendMail({
      to: user.email,
      subject: "Réinitialisez votre mot de passe",
      html: `<p>Ce lien expire dans une heure.</p><p><a href="${baseUrl}/reinitialisation?token=${token}">Choisir un nouveau mot de passe</a></p>`,
    });
  }
  return Response.json({ ok: true });
}
