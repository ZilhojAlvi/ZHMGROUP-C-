import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { mapUser } from "@/lib/mappers";

export async function GET() {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: current.id },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: mapUser(user) }, { status: 200 });
}
