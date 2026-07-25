import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import type { Role } from "@/types";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-insecure-secret-change-me"
);

// Route prefix -> roles allowed to access it. Any authenticated user may
// access a prefix that maps to `null`.
const ROLE_PROTECTED_PREFIXES: { prefix: string; roles: Role[] | null }[] = [
  { prefix: "/dashboard/customer", roles: ["customer"] },
  { prefix: "/dashboard/agent", roles: ["agent"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/agent", roles: ["agent"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/booking", roles: ["customer"] },
  { prefix: "/bookings", roles: ["customer"] },
  { prefix: "/profile", roles: null },
];

function matchProtected(pathname: string) {
  return ROLE_PROTECTED_PREFIXES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = matchProtected(pathname);
  if (!match) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const role = payload.role as Role;

    if (match.roles && !match.roles.includes(role)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/agent/:path*", "/admin/:path*", "/booking/:path*", "/bookings/:path*", "/profile/:path*"],
};
