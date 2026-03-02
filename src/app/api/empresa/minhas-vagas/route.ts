// src/app/api/empresa/minhas-vagas/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const vagas = await prisma.jobListing.findMany({
      where: { company: { userId: session.user.id } },
      select: { 
        id: true, 
        title: true,
        contractType: true, // Adicionado para a UI
        island: true,       // Adicionado para a UI
        status: true,       // Adicionado para a UI
        isFeatured: true,   // Adicionado para o ícone da Estrela
        _count: { select: { applications: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: vagas });
  } catch {
    return NextResponse.json({ message: "Erro ao carregar vagas" }, { status: 500 });
  }
}