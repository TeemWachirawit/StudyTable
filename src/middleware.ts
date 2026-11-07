import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "studytable-dev-secret-change-in-production",
}).auth;

export const config = {
  matcher: ["/planner/:path*", "/table/:path*", "/exam/:path*", "/signin", "/signup"],
};

