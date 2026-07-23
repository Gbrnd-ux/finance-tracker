import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isPublicRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname.startsWith("/api/auth");
      
      if (isPublicRoute) {
        if (isLoggedIn) {
            // Jika sudah login tapi akses /login atau /register, redirect ke dashboard
            if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
                return Response.redirect(new URL("/", nextUrl));
            }
        }
        return true;
      }
      
      // Jika bukan rute publik dan belum login, block dan biarkan middleware NextAuth redirect ke signIn
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
