// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        candidateProfile: { select: { firstName: true, lastName: true, island: true } },
        companyProfile: { select: { name: true, island: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json({ message: "Erro ao procurar utilizadores" }, { status: 500 });
  }
}