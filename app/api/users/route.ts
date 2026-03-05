import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name } = body as { email: string; name?: string };
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }
  const user = await prisma.user.create({
    data: { email, name: name ?? null },
  });
  return NextResponse.json(user);
}
