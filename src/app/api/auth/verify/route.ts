import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirect = new URL("/connexion?verified=1", url.origin);
  if (!token) return Response.redirect(new URL("/connexion?error=token", url.origin));

  const record = await db.verificationToken.findFirst({ where: { token: hashToken(token) } });
  if (!record || record.expires < new Date()) {
    return Response.redirect(new URL("/connexion?error=token", url.origin));
  }
  await db.$transaction([
    db.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } }),
    db.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token: record.token } },
    }),
  ]);
  return Response.redirect(redirect);
}
