// src/app/api/empresa/vagas/[id]/candidatos/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const vaga = await prisma.jobListing.findFirst({
      where: { id: params.id, company: { userId: session.user.id } },
    });

    if (!vaga) {
      return NextResponse.json({ message: "Vaga não encontrada" }, { status: 404 });
    }

    const candidaturas = await prisma.application.findMany({
      where: { jobId: params.id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            island: true,
            cvUrl: true,
            // 👇 CORREÇÃO: O email está dentro do modelo User
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: candidaturas, jobTitle: vaga.title });
  } catch {
    return NextResponse.json({ message: "Erro ao carregar candidatos" }, { status: 500 });
  }
}