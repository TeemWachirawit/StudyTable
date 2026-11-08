import type { NextAuthConfig } from "next-auth";

const protectedPaths = ["/planner", "/table", "/exam", "/dashboard", "/settings"];
const authPaths = ["/signin", "/signup"];
const MAX_COOKIE_IMAGE_LENGTH = 2048;

function sanitizeCookieImage(image: unknown): string | null {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  if (!trimmed || trimmed.length > MAX_COOKIE_IMAGE_LENGTH) return null;
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return null;
}

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
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = sanitizeCookieImage(user.image);
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { name?: unknown; image?: unknown };
        if (typeof s.name === "string") {
          const trimmedName = s.name.trim();
          if (trimmedName.length > 0 && trimmedName.length <= 60) {
            token.name = trimmedName;
          }
        }
        if (s.image !== undefined) {
          token.picture = sanitizeCookieImage(s.image);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = String(token.id);
        if (token.name) session.user.name = token.name as string;
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

