import type { NextAuthConfig } from "next-auth";

const protectedPaths = ["/planner", "/table", "/exam", "/dashboard"];
const authPaths = ["/signin", "/signup"];

export function getAuthSecret(): string {
  const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim();
  if (secret) return secret;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")
  ) {
    throw new Error("Missing AUTH_SECRET environment variable in production.");
  }
  return "studytable-dev-secret-change-in-production";
}

export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const pathname = nextUrl.pathname;

      const isProtected = protectedPaths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      const isAuthPage = authPaths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/signin", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(redirectUrl);
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

