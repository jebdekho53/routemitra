// Phase 12 — Auth.js (NextAuth v5). JWT sessions; the `users` table is
// hand-managed (see lib/auth/users.ts). Credentials + optional Google.
//
// Env: AUTH_SECRET (required in prod), AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
// (optional — Google button only shows when both are set).

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { getUserByEmail, createUser } from "@/lib/auth/users";

export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (raw) => {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await getUserByEmail(parsed.data.email);
      if (!user || !user.password_hash) return null;
      const ok = await verifyPassword(parsed.data.password, user.password_hash);
      if (!ok) return null;
      return {
        id: String(user.id),
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      };
    },
  }),
];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    // Ensure a users row exists for Google sign-ins.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await getUserByEmail(user.email);
        if (!existing) {
          await createUser({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            oauthProvider: "google",
            emailVerified: true,
          });
        }
        return true;
      }
      return true;
    },
    // Resolve our DB id by email and stash it on the token.
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email).catch(() => null);
        if (dbUser) {
          token.uid = String(dbUser.id);
          token.verified = Boolean(dbUser.email_verified_at);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as { uid?: string; verified?: boolean };
        session.user.id = t.uid ?? "";
        session.user.verified = Boolean(t.verified);
      }
      return session;
    },
  },
});
