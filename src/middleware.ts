import NextAuth from "next-auth";
import { authConfig, getAuthSecret } from "./auth.config";

export default NextAuth({
  ...authConfig,
  secret: getAuthSecret(),
}).auth;

export const config = {
  matcher: [
    "/planner/:path*",
    "/table/:path*",
    "/exam/:path*",
    "/dashboard/:path*",
    "/signin",
    "/signup",
  ],
};

