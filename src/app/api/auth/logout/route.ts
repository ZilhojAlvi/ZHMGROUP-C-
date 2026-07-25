import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, clearSessionCookie } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/jwt";
import { logActivity } from "@/lib/apiHelpers";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload?.sid) {
      await prisma.session.updateMany({
        where: { id: payload.sid, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await logActivity({ userId: payload.sub, action: "auth.logout" });
    }
  }

  const res = NextResponse.json({ message: "Logged out." });
  clearSessionCookie(res);
  return res;
}
