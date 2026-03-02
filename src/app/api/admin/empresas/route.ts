// src/app/api/admin/empresas/route.ts
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

    const empresas = await prisma.companyProfile.findMany({
      include: {
        user: { select: { email: true } },
        _count: { select: { jobListings: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: empresas });
  } catch {
    return NextResponse.json({ message: "Erro ao procurar empresas" }, { status: 500 });
  }
}