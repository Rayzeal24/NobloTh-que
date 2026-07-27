import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import argon2 from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

const providers: Provider[] = [
  Credentials({
    name: "E-mail et mot de passe",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      const result = credentialsSchema.safeParse(credentials);
      if (!result.success) return null;

      const user = await db.user.findUnique({ where: { email: result.data.email } });
      if (!user?.passwordHash || !user.emailVerified) return null;
      if (!(await argon2.verify(user.passwordHash, result.data.password))) return null;

      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion", error: "/connexion" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
    authorized({ auth: session, request }) {
      const protectedPath = request.nextUrl.pathname.startsWith("/app");
      const adminPath = request.nextUrl.pathname.startsWith("/admin");
      if (adminPath) return session?.user.role === "ADMIN";
      if (protectedPath) return Boolean(session?.user);
      return true;
    },
  },
  trustHost: true,
});
