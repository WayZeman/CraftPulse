import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
    username?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    username?: string | null;
  }
}

const adminEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  events: {
    async createUser({ user }) {
      // Auto-promote bootstrap admins on first login
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        await db.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
      }
      // Award founder badge to first 100 users
      const count = await db.user.count();
      if (count <= 100) {
        const founder = await db.badge.findUnique({ where: { slug: "founder" } });
        if (founder && user.id) {
          await db.userBadge
            .create({ data: { userId: user.id, badgeId: founder.id } })
            .catch(() => null);
        }
      }
    },
    async linkAccount({ user, account }) {
      // Capture Discord ID when user signs in with Discord
      if (account.provider === "discord" && user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { discordId: account.providerAccountId },
        }).catch(() => null);
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      const userId = user?.id ?? token.sub;
      // On first sign-in OR explicit update, fetch fresh role from DB
      // (handles bootstrap-admin promotion that happens in events.createUser).
      if ((user || trigger === "update") && userId) {
        const fresh = await db.user.findUnique({
          where: { id: userId },
          select: { role: true, username: true, name: true, image: true, isBanned: true },
        });
        if (fresh) {
          if (fresh.isBanned) {
            // Force sign-out by emptying token; middleware will redirect.
            return {};
          }
          token.role = fresh.role;
          token.username = fresh.username;
          token.name = fresh.name;
          token.picture = fresh.image;
        }
      }
      if (!token.role) token.role = "USER";
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as Role) ?? "USER";
        session.user.username = (token.username as string | null) ?? null;
      }
      return session;
    },
  },
});
