import type { NextAuthConfig } from "next-auth";

const protectedPaths = ["/planner", "/table", "/exam"];
const authPaths = ["/signin", "/signup"];

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
        return Response.redirect(new URL("/planner", nextUrl.origin));
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

