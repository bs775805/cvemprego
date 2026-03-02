import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { firstName: true, lastName: true, island: true }
    });

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ message: "Erro" }, { status: 500 });
  }
}