// src/app/api/admin/pagamentos/route.ts
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

    const pagamentos = await prisma.payment.findMany({
      include: { 
        company: { select: { name: true } },
        job: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: pagamentos });
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}