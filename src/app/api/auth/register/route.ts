import argon2 from "argon2";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { rateLimit, requestKey } from "@/lib/rate-limit";
import { createToken } from "@/lib/tokens";
import { createUsernameKey, registrationSchema } from "@/lib/validation/account";

export async function POST(request: Request) {
  if (!rateLimit(requestKey(request, "register"), 4, 15 * 60_000)) {
    return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies." }, { status: 400 });
  }
  const usernameKey = createUsernameKey(parsed.data.name);
  const existing = await db.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { usernameKey }] },
    select: { email: true, usernameKey: true, emailVerified: true, passwordHash: true },
  });
  if (existing?.email === parsed.data.email) {
    if (!existing.emailVerified && existing.passwordHash && await argon2.verify(existing.passwordHash, parsed.data.password)) {
      await db.verificationToken.deleteMany({ where: { identifier: existing.email } });
      const { token, hash } = createToken();
      await db.verificationToken.create({
        data: {
          identifier: existing.email,
          token: hash,
          expires: new Date(Date.now() + 24 * 60 * 60_000),
        },
      });
      const baseUrl = process.env.AUTH_URL ?? new URL(request.url).origin;
      await sendMail({
        to: existing.email,
        subject: "Confirmez votre compte NobloThèque",
        html: `<p>Bienvenue sur NobloThèque.</p><p><a href="${baseUrl}/api/auth/verify?token=${token}">Confirmer mon adresse</a></p>`,
      });
      return Response.json({ ok: true, resent: true });
    }
    return Response.json({ error: "Un compte utilise déjà cette adresse." }, { status: 409 });
  }
  if (existing?.usernameKey === usernameKey) {
    return Response.json({ error: "Ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
  }

  const { password, ...profile } = parsed.data;
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const { token, hash } = createToken();
  try {
    await db.$transaction([
      db.user.create({ data: { ...profile, usernameKey, passwordHash } }),
      db.verificationToken.create({
        data: {
          identifier: parsed.data.email,
          token: hash,
          expires: new Date(Date.now() + 24 * 60 * 60_000),
        },
      }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Cette adresse ou ce nom d’utilisateur est déjà utilisé." }, { status: 409 });
    }
    throw error;
  }
  const baseUrl = process.env.AUTH_URL ?? new URL(request.url).origin;
  await sendMail({
    to: parsed.data.email,
    subject: "Confirmez votre compte NobloThèque",
    html: `<p>Bienvenue sur NobloThèque.</p><p><a href="${baseUrl}/api/auth/verify?token=${token}">Confirmer mon adresse</a></p>`,
  });
  return Response.json({ ok: true }, { status: 201 });
}
